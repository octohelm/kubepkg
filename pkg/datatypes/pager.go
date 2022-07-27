package datatypes

type Pager struct {
	Size   int64 `name:"size,omitempty" in:"query" default:"10" validate:"@int64[-1,]"`
	Offset int64 `name:"offset,omitempty" in:"query" default:"0" validate:"@int64[0,]"`
}

func (p *Pager) SetDefaults() {
	if p.Size == 0 {
		p.Size = 10
	}

	if p.Size > 50 {
		p.Size = 50
	}
}
