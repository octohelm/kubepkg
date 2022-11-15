package datatypes

import (
	"database/sql/driver"
	"time"
	_ "time/tzdata"

	"github.com/octohelm/storage/pkg/dal"
	"github.com/octohelm/storage/pkg/datatypes"
)

type Timestamp = datatypes.Timestamp

var TimestampZero = datatypes.TimestampZero

type DeprecatedTime struct {
	// 废弃时间
	DeprecatedAt Timestamp `db:"f_deprecated_at,default='0'" json:"deprecatedAt"`
}

func (times *DeprecatedTime) MarkDeprecatedAt() {
	times.DeprecatedAt = Timestamp(time.Now())
}

type CreationTime struct {
	// 创建时间
	CreatedAt Timestamp `db:"f_created_at,default='0'" json:"createdAt"`
}

func (times *CreationTime) MarkCreatedAt() {
	times.CreatedAt = Timestamp(time.Now())
}

type CreationUpdationTime struct {
	CreationTime
	UpdatedAt Timestamp `db:"f_updated_at,default='0'" json:"updatedAt"`
}

func (times *CreationUpdationTime) MarkUpdatedAt() {
	times.UpdatedAt = Timestamp(time.Now())
}

func (times *CreationUpdationTime) MarkCreatedAt() {
	times.MarkUpdatedAt()
	times.CreatedAt = times.UpdatedAt
}

var _ dal.ModelWithSoftDelete = &CreationUpdationDeletionTime{}

type CreationUpdationDeletionTime struct {
	CreationUpdationTime
	DeletedAt Timestamp `db:"f_deleted_at,default='0'" json:"deletedAt,omitempty"`
}

func (CreationUpdationDeletionTime) SoftDeleteFieldAndZeroValue() (string, driver.Value) {
	return "DeletedAt", int64(0)
}

func (times *CreationUpdationDeletionTime) MarkDeletedAt() {
	times.MarkUpdatedAt()
	times.DeletedAt = times.UpdatedAt
}
