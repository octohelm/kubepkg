package datatypes

import "github.com/octohelm/storage/pkg/datatypes"

type SFID = datatypes.SFID

type PrimaryID struct {
	// 自增 ID
	ID uint64 `db:"f_id,autoincrement" json:"-"`
}
