import { guilds as UltimateGuildsStore } from "replugged/common";
import { PluginInjector } from "../index";
import { EmojiStore, EmojiUtils, PickerSidebar } from "../lib/requiredModules";
import * as Types from "../types";
export default (): void => {
  PluginInjector.before(PickerSidebar, "default", (args: [Types.sidebarProps]) => {
    const [sidebarProps] = args;
    sidebarProps.categories = sidebarProps.categories
      .map((category) => {
        if (
          !category?.guild ||
          (UltimateGuildsStore.getGuildId() == category?.guild?.id && !sidebarProps.children())
        )
          return category;
        const UsableEmojisInGuild = EmojiStore.getGuildEmoji(category?.guild?.id).filter(
          (emoji) => !EmojiUtils.isEmojiDisabled({ emoji }),
        );
        if (UsableEmojisInGuild.length) return category;
        return null;
      })
      .filter(Boolean);
    sidebarProps.rowCount = sidebarProps.categories.length;
    sidebarProps.rowCountBySection = [
      sidebarProps.categories.filter(({ type }) => type !== "GUILD" && type !== "UNICODE").length,
      sidebarProps.categories.filter(({ type }) => type == "GUILD").length,
      sidebarProps.categories.filter(({ type }) => type == "UNICODE").length,
    ];
    PluginInjector.after(
      sidebarProps,
      "renderCategoryListItem",
      (_args, res: React.ReactElement) => {
        res.props.categories = sidebarProps.categories;
        res.props.category = sidebarProps.categories[res.props.categoryIndex];
        return res;
      },
    );
    if (!sidebarProps.categories.some((category) => category?.type == "GUILD"))
      if (typeof sidebarProps?.children == "function")
        PluginInjector.instead(sidebarProps, "children", () => null);
    return args;
  });
};
