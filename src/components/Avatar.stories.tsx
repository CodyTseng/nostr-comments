import type { Meta, StoryObj } from '@storybook/react-vite'
import { Avatar } from './Avatar'
import { getAvatarDataUrl } from '../utils/avatar'

const SAMPLE_PUBKEYS = [
  '82341f882b6eabcd2ba7f1ef90aad961cf074af15b9ef44a09f9d2a8fbfbe6a2',
  'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
  '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
]

const meta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
  args: {
    pubkey: SAMPLE_PUBKEYS[0],
    size: 40,
  },
  argTypes: {
    size: {
      control: { type: 'range', min: 16, max: 128, step: 8 },
    },
  },
}

export default meta
type Story = StoryObj<typeof Avatar>

export const Default: Story = {}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <Avatar pubkey={SAMPLE_PUBKEYS[0]} size={24} />
      <Avatar pubkey={SAMPLE_PUBKEYS[0]} size={40} />
      <Avatar pubkey={SAMPLE_PUBKEYS[0]} size={64} />
      <Avatar pubkey={SAMPLE_PUBKEYS[0]} size={96} />
    </div>
  ),
}

export const DifferentPubkeys: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      {SAMPLE_PUBKEYS.map((pubkey) => (
        <Avatar key={pubkey} pubkey={pubkey} size={48} />
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Each pubkey generates a unique avatar pattern',
      },
    },
  },
}

export const GeneratedOnly: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      {SAMPLE_PUBKEYS.map((pubkey) => (
        <img
          key={pubkey}
          src={getAvatarDataUrl(pubkey, 48)}
          width={48}
          height={48}
          style={{ borderRadius: '50%' }}
        />
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Generated avatars without profile fetch',
      },
    },
  },
}
