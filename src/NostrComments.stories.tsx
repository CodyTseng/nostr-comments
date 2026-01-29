import type { Meta, StoryObj } from "@storybook/react-vite";
import { NostrComments } from "./NostrComments";

const meta: Meta<typeof NostrComments> = {
  title: "NostrComments",
  component: NostrComments,
  args: {
    url: "http://localhost:5175/",
  },
  argTypes: {
    locale: {
      control: "select",
      options: [
        "en",
        "zh-CN",
        "zh-TW",
        "ja",
        "ko",
        "es",
        "fr",
        "de",
        "pt",
        "ru",
        "ar",
        "it",
        "nl",
        "pl",
        "tr",
        "vi",
        "th",
        "id",
        "hi",
        "uk",
      ],
    },
    theme: {
      control: "select",
      options: ["light", "dark", "auto"],
    },
    enabledSigners: {
      control: "check",
      options: ["nip07", "bunker", "temp"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof NostrComments>;

export const Default: Story = {
  args: {
    url: "http://localhost:5175/",
    theme: "light",
  },
};

export const Chinese: Story = {
  args: {
    locale: "zh-CN",
  },
};

export const CustomRelays: Story = {
  args: {
    relays: ["wss://relay.damus.io", "wss://nos.lol"],
  },
};

export const OnlyExtension: Story = {
  args: {
    enabledSigners: ["nip07"],
  },
  parameters: {
    docs: {
      description: {
        story: "Only browser extension (NIP-07) login enabled",
      },
    },
  },
};

export const OnlyTempAccount: Story = {
  args: {
    enabledSigners: ["temp"],
  },
  parameters: {
    docs: {
      description: {
        story: "Only temporary account login enabled",
      },
    },
  },
};
