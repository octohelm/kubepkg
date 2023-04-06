import { KubepkgChannel } from "@webapp/dashboard/client/dashboard";
import { t, component } from "@nodepkg/runtime";
import { styled, Box } from "@nodepkg/ui";

export const GroupKubepkgChannelSwitch = component(
  {
    value: t.nativeEnum(KubepkgChannel),
    onValueChange: t.custom<(c: KubepkgChannel) => void>()
  },
  (props, { emit }) => {
    const channels = [
      KubepkgChannel.DEV,
      KubepkgChannel.BETA,
      KubepkgChannel.RC,
      KubepkgChannel.STABLE
    ];

    return () => {
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 8 }}>
          {channels.map((channel) => {
            return (
              <ChannelChip
                active={channel == props.value}
                key={channel}
                onClick={() => {
                  emit("value-change", channel);
                }}
              >
                {channel}
              </ChannelChip>
            );
          })}
        </Box>
      );
    };
  }
);

const ChannelChip = styled("span", {
  active: t.boolean().optional()
})({
  px: 10,
  h: 18,
  rounded: 18,
  textStyle: "sys.body-small",
  containerStyle: "sys.surface-container",
  display: "inline-flex",
  alignItems: "center",
  cursor: "pointer",

  _active: {
    containerStyle: "sys.primary-container"
  }
});
