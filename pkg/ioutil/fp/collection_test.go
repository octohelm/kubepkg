package fp

import (
	"fmt"
	"testing"
)

func Test(t *testing.T) {
	_ = Pipe1(
		[]int{1, 2, 3, 4, 5, 6, 7, 8},
		FilterMap(func(v int) (string, bool) {
			if v%2 == 0 {
				return fmt.Sprintf("%d", v), true
			}
			return "", false
		}),
	)
}
