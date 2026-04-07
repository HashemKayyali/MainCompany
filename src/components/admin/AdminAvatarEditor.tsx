import { Link2, RotateCcw, UploadCloud } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import {
  normalizeAvatarUrl,
  type AvatarSelection,
} from '../../lib/avatar'
import AvatarPicker from '../ui/AvatarPicker'
import ImageUploader from '../ui/ImageUploader'
import UserAvatar from '../ui/UserAvatar'
import { cn } from '../../utils/cn'

type AdminAvatarEditorProps = {
  name: string
  email: string
  avatarUrl: string
  onAvatarUrlChange: (value: string) => void
  avatarSelection: AvatarSelection
  onAvatarSelectionChange: (value: AvatarSelection) => void
  identitySeed: string
  onReset: () => void
}

export default function AdminAvatarEditor({
  name,
  email,
  avatarUrl,
  onAvatarUrlChange,
  avatarSelection,
  onAvatarSelectionChange,
  identitySeed,
  onReset,
}: AdminAvatarEditorProps) {
  const { isDark } = useTheme()
  const resolvedAvatarUrl = normalizeAvatarUrl(avatarUrl)

  return (
    <div
      className={cn(
        'space-y-4 rounded-[24px] border p-4',
        isDark
          ? 'border-cyan-400/12 bg-[linear-gradient(180deg,rgba(11,17,37,0.92),rgba(7,10,24,0.98))] shadow-[0_24px_70px_-52px_rgba(34,211,238,0.22)]'
          : 'border-violet-200/70 bg-white/95 shadow-[0_20px_42px_-28px_rgba(124,58,237,0.18)]'
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-mono uppercase tracking-[0.18em]',
              isDark
                ? 'bg-cyan-400/10 text-cyan-100/80 ring-1 ring-inset ring-cyan-300/12'
                : 'bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200'
            )}
          >
            <UploadCloud className="h-3.5 w-3.5" strokeWidth={1.8} />
            Avatar Management
          </div>
          <h3 className={cn('mt-3 font-display text-[1.1rem] font-semibold', isDark ? 'text-white' : 'text-gray-900')}>
            Manage this user&apos;s identity avatar
          </h3>
          <p className={cn('mt-1 max-w-[40rem] text-[12.5px] leading-6', isDark ? 'text-purple-100/64' : 'text-gray-600')}>
            Uploaded images take priority everywhere in the product. If you remove the photo, the saved generated avatar becomes the fallback across the app.
          </p>
        </div>

        <div
          className={cn(
            'relative overflow-hidden rounded-[28px] p-[3px]',
            isDark
              ? 'bg-[linear-gradient(145deg,rgba(34,211,238,0.34),rgba(168,85,247,0.22),rgba(236,72,153,0.18))]'
              : 'bg-[linear-gradient(145deg,rgba(124,58,237,0.18),rgba(236,72,153,0.14))]'
          )}
        >
          <div
            className={cn(
              'rounded-[26px] p-2',
              isDark
                ? 'bg-[linear-gradient(180deg,rgba(9,13,26,0.96),rgba(7,9,20,0.98))]'
                : 'bg-white'
            )}
          >
            <UserAvatar
              name={name}
              email={email}
              avatarUrl={resolvedAvatarUrl}
              avatarStyle={avatarSelection.avatarStyle}
              avatarSeed={avatarSelection.avatarSeed}
              avatarOptions={avatarSelection.avatarOptions}
              className="h-[118px] w-[118px] rounded-[22px]"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,240px)_minmax(0,1fr)]">
        <div
          className={cn(
            'space-y-3 rounded-[22px] border p-3',
            isDark
              ? 'border-white/8 bg-white/[0.03]'
              : 'border-violet-100 bg-violet-50/50'
          )}
        >
          <div>
            <div className={cn('text-[10px] font-mono uppercase tracking-[0.18em]', isDark ? 'text-cyan-100/42' : 'text-violet-600/56')}>
              Uploaded photo
            </div>
            <div className={cn('mt-2 text-sm font-medium', isDark ? 'text-white' : 'text-gray-900')}>
              {resolvedAvatarUrl ? 'Photo override is active.' : 'No uploaded photo yet.'}
            </div>
          </div>

          <div className="max-w-[220px]">
            <ImageUploader
              value={resolvedAvatarUrl || undefined}
              onChange={onAvatarUrlChange}
              onRemove={() => onAvatarUrlChange('')}
              removable={!!resolvedAvatarUrl}
              folder="avatars"
              label="Avatar image"
              previewAspectClass="aspect-square"
              frameAspect={1}
              frameTitle="Adjust Avatar Frame"
              frameHint="Keep the focal point centered for the cleanest avatar crop."
            />
          </div>

          <div>
            <label className={cn('mb-1.5 block text-[11px] font-mono uppercase tracking-[0.18em]', isDark ? 'text-purple-200/70' : 'text-gray-500')}>
              Avatar image URL
            </label>
            <div className="relative">
              <Link2 className={cn('pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2', isDark ? 'text-cyan-100/36' : 'text-violet-500/50')} strokeWidth={1.9} />
              <input
                className="form-field !mb-0 !pl-11"
                value={avatarUrl}
                onChange={event => onAvatarUrlChange(event.target.value)}
                placeholder="https://example.com/avatar.webp"
              />
            </div>
            <p className={cn('mt-2 text-[11px] leading-5', isDark ? 'text-purple-100/48' : 'text-gray-500')}>
              You can upload a new avatar above or paste a public image URL directly.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {resolvedAvatarUrl ? (
              <button
                type="button"
                onClick={() => onAvatarUrlChange('')}
                className={cn(
                  'inline-flex items-center gap-2 rounded-[14px] px-3 py-2 text-[11px] font-semibold transition',
                  isDark
                    ? 'bg-rose-500/10 text-rose-200 ring-1 ring-inset ring-rose-400/16 hover:bg-rose-500/16'
                    : 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200 hover:bg-rose-100'
                )}
              >
                Remove Photo
              </button>
            ) : null}

            <button
              type="button"
              onClick={onReset}
              className={cn(
                'inline-flex items-center gap-2 rounded-[14px] px-3 py-2 text-[11px] font-semibold transition',
                isDark
                  ? 'bg-[#0f1733] text-cyan-100/82 ring-1 ring-inset ring-cyan-400/14 hover:bg-[#111d40] hover:text-white'
                  : 'bg-white text-violet-700 ring-1 ring-inset ring-violet-200 hover:bg-violet-50'
              )}
            >
              <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.9} />
              Reset Avatar
            </button>
          </div>
        </div>

        <AvatarPicker
          value={avatarSelection}
          onChange={onAvatarSelectionChange}
          identitySeed={identitySeed}
          title="Generated fallback avatar"
          description="This saved illustrated identity is used whenever there is no uploaded photo on the profile."
          compact
        />
      </div>
    </div>
  )
}
