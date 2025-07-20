import type { Editor } from '@tiptap/react'
import { useEditorState } from '@tiptap/react'
import {
  LuStrikethrough,
  LuPilcrow,
  LuHeading1,
  LuHeading2,
  LuQuote,
  LuList,
  LuUndo,
  LuRedo,
} from 'react-icons/lu'


export function MenuBar({ editor }: { editor: Editor }) {
  // Read the current editor's state, and re-render the component when it changes
  const editorState = useEditorState({
    editor,
    selector: ctx => {
      return {
        isStrike: ctx.editor.isActive('strike'),
        canStrike: ctx.editor.can().chain().focus().toggleStrike().run(),
        isParagraph: ctx.editor.isActive('paragraph'),
        isHeading1: ctx.editor.isActive('heading', { level: 1 }),
        isHeading2: ctx.editor.isActive('heading', { level: 2 }),
        isHeading3: ctx.editor.isActive('heading', { level: 3 }),
        isBulletList: ctx.editor.isActive('bulletList'),
        isBlockquote: ctx.editor.isActive('blockquote'),
        canUndo: ctx.editor.can().chain().focus().undo().run(),
        canRedo: ctx.editor.can().chain().focus().redo().run(),
      }
    },
  })

  return (
    <div className="control-group w-full">
      <div className="button-group flex justify-center flex-nowrap overflow-x-auto pb-2 gap-1 sm:gap-2">
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editorState.canStrike}
          className={`whitespace-nowrap flex-shrink-0 p-1 sm:p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${editorState.isStrike ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
        >
          <div className="menu-item flex flex-col sm:flex-row items-center">
            <LuStrikethrough size={18} />
            <span className="text-xs sm:text-sm sm:mr-1">Strike</span>
          </div>
        </button>
        <button
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={`whitespace-nowrap flex-shrink-0 p-1 sm:p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${editorState.isParagraph ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
        >
          <div className="menu-item flex flex-col sm:flex-row items-center">
            <LuPilcrow size={18} />
            <span className="text-xs sm:text-sm sm:mr-1">Paragraph</span>
          </div>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`whitespace-nowrap flex-shrink-0 p-1 sm:p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${editorState.isHeading1 ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
        >
          <div className="menu-item flex flex-col sm:flex-row items-center">
            <LuHeading1 size={18} />
          </div>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`whitespace-nowrap flex-shrink-0 p-1 sm:p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${editorState.isHeading2 ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
        >
          <div className="menu-item flex flex-col sm:flex-row items-center">
            <LuHeading2 size={18} />
          </div>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`whitespace-nowrap flex-shrink-0 p-1 sm:p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${editorState.isBulletList ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
        >
          <div className="menu-item flex flex-col sm:flex-row items-center">
            <LuList size={18} />
            <span className="text-xs sm:text-sm sm:mr-1">Bullet list</span>
          </div>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`whitespace-nowrap flex-shrink-0 p-1 sm:p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${editorState.isBlockquote ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
        >
           <div className="menu-item flex flex-col sm:flex-row items-center">
            <LuQuote size={18} />
            <span className="text-xs sm:text-sm sm:mr-1">Blockquote</span>
          </div>
        </button>
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editorState.canUndo}
          className="whitespace-nowrap flex-shrink-0 p-1 sm:p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
        >
          <div className="menu-item flex flex-col sm:flex-row items-center">
            <LuUndo size={18} />
            <span className="text-xs sm:text-sm sm:mr-1">Undo</span>
          </div>
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editorState.canRedo}
          className="whitespace-nowrap flex-shrink-0 p-1 sm:p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
        >
          <div className="menu-item flex flex-col sm:flex-row items-center">
            <LuRedo size={18} />
            <span className="text-xs sm:text-sm sm:mr-1">Redo</span>
          </div>
        </button>
      </div>
    </div>
  )
}