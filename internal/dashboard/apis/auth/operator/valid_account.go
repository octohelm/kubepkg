package operator

import (
	"context"
	"net/http"
	"strconv"

	"github.com/octohelm/kubepkg/pkg/ioutil"

	b "github.com/octohelm/storage/pkg/sqlbuilder"

	"github.com/octohelm/kubepkg/pkg/ioutil/fp"

	"github.com/octohelm/courier/pkg/expression"
	"github.com/octohelm/courier/pkg/statuserror"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/account"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/group"
	grouprepository "github.com/octohelm/kubepkg/internal/dashboard/domain/group/repository"
	"github.com/octohelm/kubepkg/pkg/auth"
	"github.com/octohelm/kubepkg/pkg/signer"
)

type ValidAccount struct {
	// Bearer access_token
	Authorization string `name:"Authorization,omitempty" in:"header"`
	// Bearer access_token in query
	AuthorizationInQuery string `name:"authorization,omitempty" in:"query"`
}

func (c *ValidAccount) Output(ctx context.Context) (interface{}, error) {
	accessToken := ""

	if c.Authorization != "" {
		a := auth.ParseAuthorization(c.Authorization)
		accessToken = a.Get("Bearer")
	}

	if c.AuthorizationInQuery != "" {
		a := auth.ParseAuthorization(c.AuthorizationInQuery)
		accessToken = a.Get("Bearer")
	}

	tok, err := signer.FromContext(ctx).Validate(ctx, accessToken)
	if err != nil {
		return nil, statuserror.Wrap(err, http.StatusUnauthorized, "InvalidToken")
	}

	audience := tok.Audience()

	a := &Account{}

	id, errForParse := strconv.ParseUint(audience[0], 10, 64)
	if errForParse != nil {
		return nil, statuserror.Wrap(errForParse, http.StatusUnauthorized, "InvalidToken")
	}

	a.AccountID = account.ID(id)
	a.AdminRole = group.ROLE_TYPE__GUEST
	a.AccountType = account.TYPE__USER

	for i, aud := range audience {
		if i == 1 {
			a.AccountType, _ = account.ParseTypeFromString(aud)
		}
		if aud == "ADMIN_INIT" {
			a.AdminRole = group.ROLE_TYPE__OWNER
		}
	}

	if a.AccountType == account.TYPE__USER {
		gar := grouprepository.NewGroupAccountRepository(grouprepository.AdminGroup())
		groupAccounts, err := gar.List(ctx, group.AccountT.AccountID.V(b.Eq(a.AccountID)))
		if err != nil {
			return nil, err
		}
		if len(groupAccounts) > 0 {
			a.AdminRole = groupAccounts[0].RoleType
		}
	}

	return a, nil
}

type Account struct {
	account.User
	AccountType account.Type                `json:"accountType"`
	AdminRole   group.RoleType              `json:"adminRole"`
	GroupRoles  map[group.ID]group.RoleType `json:"groupRoles,omitempty"`
}

func (a *Account) InjectContext(ctx context.Context) context.Context {
	return fp.Pipe2(
		ctx,
		fp.CurryRight2(AccountContext.With)(a),
		fp.CurryRight2(expression.WithValueGetter)(expression.ValueGetterFunc(func(name string) (any, bool) {
			switch name {
			case "adminRole":
				return a.AdminRole.String(), true
			}
			return "", false
		})),
	)
}

var AccountContext = ioutil.ContextFor[*Account](nil)
