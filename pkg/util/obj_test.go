package util

import (
	"testing"

	testingx "github.com/octohelm/x/testing"
)

func TestDiffObj(t *testing.T) {
	t.Run("should diff modified", func(t *testing.T) {
		testingx.Expect(t, DiffObj(
			map[string]any{
				"m": "1",
			},
			map[string]any{
				"m": "2",
			},
		), testingx.Equal(map[string]any{
			"m": "2",
		}))
	})

	t.Run("should diff added", func(t *testing.T) {
		testingx.Expect(t, DiffObj(
			map[string]any{
				"x": []any{"cp", "x"},
				"d": map[string]any{
					"c": "c",
				},
			},
			map[string]any{
				"x": []any{"cp", "x"},
				"a": "a",
				"d": map[string]any{
					"c": "c!",
				},
			},
		), testingx.Equal(map[string]any{
			"a": "a",
			"d": map[string]any{
				"c": "c!",
			},
		}))
	})
}
