import { toast } from 'sonner'

/**
 * Toast a form's values as formatted JSON.
 *
 * A **development placeholder**, not a real submit handler — it shows what
 * would have been sent and saves nothing. The Appearance form is its current
 * caller: it applies theme and font choices locally, then shows the submitted
 * values here instead of sending them to the API. Remove that call when those
 * settings gain persistence.
 *
 * Treat a call to this in a new screen as a to-do, not a pattern to copy.
 *
 * @param data - The values to display; serialised with `JSON.stringify`
 * @param title - Heading for the toast
 */
export function showSubmittedData(
  data: unknown,
  title: string = 'You submitted the following values:'
) {
  toast.message(title, {
    description: (
      <pre className='mt-2 w-full overflow-x-auto rounded-md bg-slate-950 p-4'>
        <code className='text-white'>{JSON.stringify(data, null, 2)}</code>
      </pre>
    ),
  })
}
