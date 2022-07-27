package account

import "github.com/octohelm/kubepkg/pkg/datatypes"

// +gengo:table:group=account
// +gengo:table:register=T
// @def primary ID
// @def unique_index i_vendor_identity VendorIdentityFrom VendorIdentity
// @def index i_account_id AccountID
// @def index i_created_at CreatedAt
// @def index i_updated_at UpdatedAt
type VendorIdentity struct {
	AccountID          ID     `db:"f_account_id" json:"accountID"`
	VendorIdentityFrom string `db:"f_vendor_identity_from" json:"vendorIdentityFrom"`
	VendorIdentity     string `db:"f_vendor_identity" json:"vendorIdentity"`

	datatypes.PrimaryID
	datatypes.CreationUpdationTime
}
