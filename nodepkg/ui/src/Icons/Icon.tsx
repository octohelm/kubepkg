import { t } from "@nodepkg/runtime";
import { styled } from "@innoai-tech/vueuikit";

export const Icon = styled(
  "span",
  {
    path: t.string(),
    placement: t.string().optional(),
    animate: t.boolean().optional(),
  },
  (props, {}) =>
    (Wrapper) => {
      const size = 24;

      return (
        <Wrapper data-icon={true} data-placement={props.placement}>
          <svg viewBox={`0 0 ${size} ${size}`}>
            <path d={props.path}>
              {props.animate && (
                <animateTransform
                  attributeName="transform"
                  attributeType="XML"
                  type="rotate"
                  repeatCount="indefinite"
                  dur="1s"
                  from={`0 ${size / 2} ${size / 2}`}
                  to={`360 ${size / 2} ${size / 2}`}
                />
              )}
            </path>
          </svg>
        </Wrapper>
      );
    },
)({
  display: "inline-block",
  boxSize: "1.2em",
  "& svg": {
    w: "100%",
    h: "100%",
  },
});
