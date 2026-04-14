import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect } from 'react'

export default function ArticleEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[320px]',
      },
    },
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML() && !editor.isFocused) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  if (!editor) return null

  return (
    <div className="rounded-2xl border border-slatex/10 bg-white overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-slatex/10 bg-slatex/5 px-4 py-3">
        <div className="mr-2 text-xs font-semibold uppercase tracking-wider text-slatex/50">Editor</div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`rounded px-2 py-1 text-sm font-bold ${editor.isActive('bold') ? 'bg-slatex text-white' : 'hover:bg-slatex/10 text-slatex/70'}`}
          >
            B
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`rounded px-2 py-1 text-sm italic ${editor.isActive('italic') ? 'bg-slatex text-white' : 'hover:bg-slatex/10 text-slatex/70'}`}
          >
            I
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`rounded px-2 py-1 text-sm font-semibold ${editor.isActive('heading', { level: 2 }) ? 'bg-slatex text-white' : 'hover:bg-slatex/10 text-slatex/70'}`}
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`rounded px-2 py-1 text-sm font-semibold ${editor.isActive('heading', { level: 3 }) ? 'bg-slatex text-white' : 'hover:bg-slatex/10 text-slatex/70'}`}
          >
            H3
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`rounded px-2 py-1 text-sm ${editor.isActive('bulletList') ? 'bg-slatex text-white' : 'hover:bg-slatex/10 text-slatex/70'}`}
          >
            • List
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`rounded px-2 py-1 text-sm ${editor.isActive('blockquote') ? 'bg-slatex text-white' : 'hover:bg-slatex/10 text-slatex/70'}`}
          >
            " Quote
          </button>
        </div>
      </div>
      <div className="p-5 bg-white">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
