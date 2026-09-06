'use client'

import type { CSSProperties, ReactNode, Ref } from 'react'
import { useEffect, useId, useImperativeHandle, useRef, useState } from 'react'
import { KeyboardArrowDownIcon } from './icons/KeyboardArrowDownIcon'
import { COLOR } from '../constants'

// Vue 版（@geckou/ui-vue）の defineExpose({ isContentsOpened }) 相当
export type DropdownUiHandle = {
  isContentsOpened: () => boolean
  close: () => void
}

type Props = {
  isHiddenArrow?: boolean
  contentAlignment?: 'left' | 'center' | 'right'
  isDisabled?: boolean
  contentsWidth?: string
  trigger: ReactNode
  contents?: ReactNode
  ref?: Ref<DropdownUiHandle>
}

export function DropdownUi({
  isHiddenArrow = false,
  contentAlignment = 'left',
  isDisabled = false,
  contentsWidth = 'auto',
  trigger,
  contents,
  ref,
}: Props) {
  const [isContentsOpened, setIsContentsOpened] = useState(false)
  const [contentsHeight, setContentsHeight] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const contentsRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  // aria-controls でトリガーとパネルを結ぶための id。
  // 1 画面に複数置いても衝突しないよう useId から作る
  const panelId = `${useId()}-panel`

  const toggleBox = () => setIsContentsOpened((current) => !current)
  const closeDropDown = () => setIsContentsOpened(false)

  // Escape で閉じ、トリガーへフォーカスを戻す。戻さないと、閉じた瞬間に
  // フォーカスが body へ落ちてキーボード操作の位置を見失う
  const closeAndRefocus = () => {
    closeDropDown()
    triggerRef.current?.focus()
  }

  useImperativeHandle(ref, () => ({
    isContentsOpened: () => isContentsOpened,
    close: closeDropDown,
  }))

  useEffect(() => {
    const handleClickOutside = (event: PointerEvent) => {
      const root = rootRef.current
      if (root && !root.contains(event.target as Node)) {
        closeDropDown()
      }
    }

    document.addEventListener('pointerdown', handleClickOutside)
    return () => document.removeEventListener('pointerdown', handleClickOutside)
  }, [])

  useEffect(() => {
    const contentsElement = contentsRef.current
    if (!contentsElement) {
      return
    }

    const updateContentsHeight = () =>
      setContentsHeight(contentsElement.clientHeight)

    updateContentsHeight()
    const observer = new ResizeObserver(updateContentsHeight)
    observer.observe(contentsElement)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- サイズ変化は ResizeObserver が検知するため、contents の有無が変わったときだけ再登録する
  }, [Boolean(contents)])

  const isInactive = isDisabled || !contents

  const style = {
    '--trigger-color': isInactive ? COLOR.black : COLOR.blue,
  } as CSSProperties

  const contentsStyle: CSSProperties = {
    boxShadow: isContentsOpened ? '0 0 6px #33333333' : 'none',
    blockSize: isContentsOpened ? `${contentsHeight}px` : 0,
    inlineSize: contentsWidth,
    right:
      contentAlignment === 'right'
        ? 'calc(var(--bv, 0.375rem) * -0.5)'
        : 'auto',
    left:
      contentAlignment === 'left' ? 'calc(var(--bv, 0.375rem) * -0.5)' : 'auto',
    zIndex: 2,
  }

  return (
    <div
      ref={rootRef}
      className="relative"
      onKeyDown={(event) => {
        if (event.key !== 'Escape' || !isContentsOpened) {
          return
        }

        // 自分が処理した印を残す。ModalBox の中に置いたとき、
        // ダイアログまで一緒に閉じるのを防ぐ
        event.preventDefault()
        closeAndRefocus()
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        disabled={isDisabled}
        aria-expanded={isContentsOpened}
        // contents が無ければポップアップは開かない。aria-controls と
        // 同じ条件にしないと「ポップアップを持つ」と誤って伝わる
        aria-haspopup={contents ? true : undefined}
        aria-controls={contents ? panelId : undefined}
        style={{ ...style, cursor: isInactive ? 'auto' : 'pointer' }}
        className="flex size-full items-center gap-[var(--sp-small,0.375rem)] text-(--trigger-color)"
        onClick={(event) => {
          event.preventDefault()
          toggleBox()
        }}
      >
        {trigger}
        {!(isHiddenArrow || !contents || isDisabled) && (
          <KeyboardArrowDownIcon
            className={`size-[var(--icon-small,0.9375rem)] flex-none transition-all duration-100 ${isContentsOpened ? 'rotate-180' : ''}`}
          />
        )}
      </button>
      {contents && (
        <div
          id={panelId}
          style={contentsStyle}
          inert={!isContentsOpened}
          className="absolute top-[calc(100%-var(--sp-min,0.1875rem))] cursor-pointer overflow-hidden rounded-[var(--radius-small,0.1875rem)] transition-[block-size] duration-100"
        >
          <div
            ref={contentsRef}
            className="max-h-[calc(var(--bv,0.375rem)*56)] min-w-[calc(var(--bv,0.375rem)*20)] overflow-auto bg-white"
            onClick={closeDropDown}
          >
            {contents}
          </div>
        </div>
      )}
    </div>
  )
}
