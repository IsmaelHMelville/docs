import { MouseEvent, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { BoxButton, Icon, TextType } from '@/components';
import { EmojiPicker, emojidata } from '@/docs/doc-editor/';

import { useDocTitleUpdate } from '../hooks/useDocTitleUpdate';

type DocIconProps = TextType & {
  emoji?: string | null;
  defaultIcon: React.ReactNode;
  docId?: string;
  title?: string;
  onEmojiUpdate?: (emoji: string) => void;
  withEmojiPicker?: boolean;
};

export const DocIcon = ({
  emoji,
  defaultIcon,
  $size = 'sm',
  $variation = '1000',
  $weight = '400',
  docId,
  title,
  onEmojiUpdate,
  withEmojiPicker = false,
  ...textProps
}: DocIconProps) => {
  const { updateDocEmoji } = useDocTitleUpdate();

  const iconRef = useRef<HTMLDivElement>(null);

  const [openEmojiPicker, setOpenEmojiPicker] = useState<boolean>(false);
  const [pickerPosition, setPickerPosition] = useState<{
    top: number;
    left: number;
  }>({ top: 0, left: 0 });

  if (!withEmojiPicker && !emoji) {
    return defaultIcon;
  }

  const toggleEmojiPicker = (e: MouseEvent) => {
    if (withEmojiPicker) {
      e.stopPropagation();
      e.preventDefault();

      if (!openEmojiPicker && iconRef.current) {
        const rect = iconRef.current.getBoundingClientRect();
        setPickerPosition({
          top: rect.bottom + window.scrollY + 8,
          left: rect.left + window.scrollX,
        });
      }

      setOpenEmojiPicker(!openEmojiPicker);
    }
  };

  const handleEmojiSelect = ({ native }: { native: string }) => {
    setOpenEmojiPicker(false);

    // Update document emoji if docId is provided
    if (docId && title !== undefined) {
      updateDocEmoji(docId, title ?? '', native);
    }

    // Call the optional callback
    onEmojiUpdate?.(native);
  };

  const handleClickOutside = () => {
    setOpenEmojiPicker(false);
  };

  return (
    <>
      <BoxButton
        ref={iconRef}
        onClick={toggleEmojiPicker}
        $position="relative"
        className="--docs--doc-icon"
      >
        {!emoji ? (
          defaultIcon
        ) : (
          <Icon
            {...textProps}
            iconName={emoji}
            $size={$size}
            $variation={$variation}
            $weight={$weight}
            aria-hidden="true"
            data-testid="doc-emoji-icon"
          >
            {emoji}
          </Icon>
        )}
      </BoxButton>
      {openEmojiPicker &&
        createPortal(
          <div
            style={{
              position: 'absolute',
              top: pickerPosition.top,
              left: pickerPosition.left,
              zIndex: 1000,
            }}
          >
            <EmojiPicker
              emojiData={emojidata}
              onEmojiSelect={handleEmojiSelect}
              onClickOutside={handleClickOutside}
            />
          </div>,
          document.body,
        )}
    </>
  );
};
