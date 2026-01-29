import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { LoginModal } from "./LoginModal";
import { I18nProvider } from "../i18n";

const localeOptions = [
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
];

const meta: Meta<typeof LoginModal> & { argTypes: { locale: unknown } } = {
  title: "Components/LoginModal",
  component: LoginModal,
  decorators: [
    (Story, context) => (
      <I18nProvider
        locale={(context.args as { locale?: string }).locale || "en"}
      >
        <Story />
      </I18nProvider>
    ),
  ],
  args: {
    isOpen: true,
    onClose: () => {},
  },
  argTypes: {
    locale: {
      control: "select",
      options: localeOptions,
    },
    enabledSigners: {
      control: "check",
      options: ["nip07", "bunker", "temp"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof LoginModal>;

export const Default: Story = {};

export const Interactive: Story = {
  args: {
    isOpen: false,
  },
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <button onClick={() => setIsOpen(true)}>Open Login Modal</button>
        <LoginModal
          {...args}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
      </>
    );
  },
};

export const Chinese: Story = {
  args: {
    // @ts-ignore - locale is used by decorator
    locale: "zh-CN",
  },
};

export const OnlyExtension: Story = {
  args: {
    enabledSigners: ["nip07"],
  },
  parameters: {
    docs: {
      description: {
        story: "Only NIP-07 browser extension option",
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
        story: "Only temporary account options (create/import)",
      },
    },
  },
};

export const ExtensionAndBunker: Story = {
  args: {
    enabledSigners: ["nip07", "bunker"],
  },
  parameters: {
    docs: {
      description: {
        story: "Extension and Bunker options only",
      },
    },
  },
};
