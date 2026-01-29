// @ts-ignore
import "../src/styles/base.css";
// @ts-ignore
import "../src/styles/variables.css";

export default {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#ffffff" },
        { name: "dark", value: "#1a1a1a" },
      ],
    },
  },
  globalTypes: {
    theme: {
      description: "Theme for components",
      defaultValue: "light",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: ["light", "dark"],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story: any, context: any) => {
      const theme = context.globals.theme || "light";
      return (
        <div className="nostr-comments" data-theme={theme}>
          <Story />
        </div>
      );
    },
  ],
};
