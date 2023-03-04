package cueutil

import (
	"testing"

	"github.com/octohelm/x/ptr"
	testingx "github.com/octohelm/x/testing"
)

type Example struct {
	Key      string            `json:"key"`
	Name     string            `json:"name,omitempty"`
	Optional *bool             `json:"optional,omitempty"`
	Settings map[string]string `json:"settings,omitempty"`
	List     []int             `json:"list,omitempty"`
}

type ExampleWithCustomStr struct {
	CustomStr CustomStr `json:"str"`
}

func TestEncodingType(t *testing.T) {
	data, err := EncodeType(&Example{})
	testingx.Expect(t, err, testingx.Be[error](nil))

	_, err = ConvertToJSONSchema(data)
	testingx.Expect(t, err, testingx.Be[error](nil))
}

func TestEncode(t *testing.T) {
	cases := []struct {
		v   any
		cue string
	}{
		{
			Example{
				Key: "test",
			},
			`{key:"test"}`,
		},

		{
			Example{
				Name: "test",
			},
			`{key:string,name:"test"}`,
		},
		{
			Example{
				Key:      "test",
				Optional: ptr.Bool(true),
			},
			`{key:"test",optional:true}`,
		},

		{
			Example{
				Key: "test",
				Settings: map[string]string{
					"a": "b",
				},
			},
			`{key:"test",settings:{"a":"b"}}`,
		},

		{
			Example{
				Key: "test",
				List: []int{
					1, 2, 3,
				},
			},
			`{key:"test",list:[1,2,3]}`,
		},

		{
			ExampleWithCustomStr{
				CustomStr: CustomStr{
					X: "x-x",
				},
			},
			`{str:"x-x"}`,
		},

		{
			ExampleWithCustomStr{
				CustomStr: CustomStr{},
			},
			`{str:string}`,
		},
	}

	for i := range cases {
		t.Run(cases[i].cue, func(t *testing.T) {
			data, err := Encode(cases[i].v)
			testingx.Expect(t, err, testingx.Be[error](nil))
			testingx.Expect(t, string(data), testingx.Be(cases[i].cue))
		})
	}
}

type CustomStr struct {
	X string
}

func (s CustomStr) UnmarshalText(text []byte) error {
	return nil
}

func (s CustomStr) MarshalText() (text []byte, err error) {
	return []byte(s.X), nil
}
