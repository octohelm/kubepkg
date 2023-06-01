package client

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"sync"

	"github.com/distribution/distribution/v3/reference"
	"github.com/distribution/distribution/v3/registry/client/auth"
	"github.com/distribution/distribution/v3/registry/client/auth/challenge"
	"github.com/distribution/distribution/v3/registry/client/transport"
	"github.com/go-courier/logr"
)

type RemoteRegistry struct {
	// Remote container registry endpoint
	Endpoint string `flag:",omitempty"`
	// Remote container registry username
	Username string `flag:",omitempty"`
	// Remote container registry password
	Password string `flag:",omitempty,secret"`
}

func NewAuthorizer(ctx context.Context, c AuthChallenger, name reference.Named, actions []string) transport.RequestModifier {
	return auth.NewAuthorizer(
		c.ChallengeManager(),
		auth.NewTokenHandler(nil, c.CredentialStore(), name.Name(), actions...),
	)
}

type AuthChallenger interface {
	TryEstablishChallenges(context.Context) error
	ChallengeManager() challenge.Manager
	CredentialStore() auth.CredentialStore
}

type remoteAuthChallenger struct {
	remoteURL url.URL
	sync.Mutex
	cm challenge.Manager
	cs auth.CredentialStore
}

func (r *remoteAuthChallenger) CredentialStore() auth.CredentialStore {
	return r.cs
}

func (r *remoteAuthChallenger) ChallengeManager() challenge.Manager {
	return r.cm
}

// tryEstablishChallenges will attempt to get a challenge type for the upstream if none currently exist
func (r *remoteAuthChallenger) TryEstablishChallenges(ctx context.Context) error {
	r.Lock()
	defer r.Unlock()

	remoteURL := r.remoteURL
	remoteURL.Path = "/v2/"
	challenges, err := r.cm.GetChallenges(remoteURL)
	if err != nil {
		return err
	}

	if len(challenges) > 0 {
		return nil
	}

	// establish challenge type with upstream
	if err := ping(r.cm, remoteURL.String(), challengeHeader); err != nil {
		return err
	}

	logr.FromContext(ctx).Debug(
		fmt.Sprintf("Challenge established with upstream: %s", remoteURL.String()),
	)

	return nil
}

const challengeHeader = "Docker-Distribution-Api-Version"

type userpass struct {
	username string
	password string
}

type credentials struct {
	creds map[string]userpass
}

func (c credentials) Basic(u *url.URL) (string, string) {
	up := c.creds[u.String()]

	return up.username, up.password
}

func (c credentials) RefreshToken(u *url.URL, service string) string {
	return ""
}

func (c credentials) SetRefreshToken(u *url.URL, service, token string) {
}

// configureAuth stores credentials for challenge responses
func configureAuth(username, password, remoteURL string) (auth.CredentialStore, error) {
	creds := map[string]userpass{}

	authURLs, err := getAuthURLs(remoteURL)
	if err != nil {
		return nil, err
	}

	for _, u := range authURLs {
		creds[u] = userpass{
			username: username,
			password: password,
		}
	}

	return credentials{creds: creds}, nil
}

func NewAuthChallenger(remoteURL *url.URL, username, password string) (AuthChallenger, error) {
	cs, err := configureAuth(username, password, remoteURL.String())
	if err != nil {
		return nil, err
	}

	return &remoteAuthChallenger{
		remoteURL: *remoteURL,
		cm:        challenge.NewSimpleManager(),
		cs:        cs,
	}, nil
}

func getAuthURLs(remoteURL string) ([]string, error) {
	authURLs := make([]string, 0)

	resp, err := http.Get(remoteURL + "/v2/")
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	for _, c := range challenge.ResponseChallenges(resp) {
		if strings.EqualFold(c.Scheme, "bearer") {
			authURLs = append(authURLs, c.Parameters["realm"])
		}
	}

	return authURLs, nil
}

func ping(manager challenge.Manager, endpoint, versionHeader string) error {
	resp, err := http.Get(endpoint)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	return manager.AddResponse(resp)
}
