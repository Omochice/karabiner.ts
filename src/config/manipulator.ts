import {
  BasicManipulator,
  FromEvent,
  Manipulator,
  ToEvent,
  ToEventOptions,
  ToMouseCursorPosition,
  ToVariable,
} from '../karabiner/karabiner-config'
import { ModifierParam } from './modifier'
import { toKey, ToKeyParam } from './to'

export class ManipulatorBuilder {
  private readonly manipulator: BasicManipulator

  constructor(from: FromEvent) {
    this.manipulator = { type: 'basic', from }
  }

  to(event: ToEvent): this
  to(key: ToKeyParam, modifiers?: ModifierParam, options?: ToEventOptions): this
  to(
    keyOrEvent: ToEvent | ToKeyParam,
    modifiers?: ModifierParam,
    options?: ToEventOptions,
  ): this {
    this.addToEvent(
      typeof keyOrEvent === 'string' || typeof keyOrEvent === 'number'
        ? toKey(keyOrEvent, modifiers, options)
        : keyOrEvent,
    )
    return this
  }

  /** Map to shell command */
  to$(shell_command: string): this {
    this.addToEvent({ shell_command })
    return this
  }

  /** Map to `$ open -a {app}.app` */
  toApp(app: string) {
    return this.to$(`open -a ${app.endsWith('.app') ? app : `${app}.app`}`)
  }

  /** Map to paste {text} via clipboard */
  toPaste(text: string) {
    return this.to$(`osascript -e '
set prev to the clipboard
set the clipboard to "${text}"
tell application "System Events"
  keystroke "v" using command down
  delay 0.1
end tell
set the clipboard to prev'`)
  }

  /** Map to setting a variable */
  toVar(name: string, value: ToVariable['value'] = 1): this {
    this.addToEvent({ set_variable: { name, value } })
    return this
  }

  /** Set mouse cursor position */
  toMouseCursorPosition(p: ToMouseCursorPosition): this {
    this.addToEvent({ software_function: { set_mouse_cursor_position: p } })
    return this
  }

  toIfAlone(event: ToEvent): this
  toIfAlone(
    key: ToKeyParam,
    modifiers?: ModifierParam,
    options?: ToEventOptions,
  ): this
  toIfAlone(
    keyOrEvent: ToEvent | ToKeyParam,
    modifiers?: ModifierParam,
    options?: ToEventOptions,
  ): this {
    this.pushOrCreateList(
      this.manipulator,
      'to_if_alone',
      typeof keyOrEvent === 'string'
        ? toKey(keyOrEvent, modifiers, options)
        : keyOrEvent,
    )
    return this
  }

  toIfHeldDown(event: ToEvent): this
  toIfHeldDown(
    key: ToKeyParam,
    modifiers?: ModifierParam,
    options?: ToEventOptions,
  ): this
  toIfHeldDown(
    keyOrEvent: ToEvent | ToKeyParam,
    modifiers?: ModifierParam,
    options?: ToEventOptions,
  ): this {
    this.pushOrCreateList(
      this.manipulator,
      'to_if_held_down',
      typeof keyOrEvent === 'string'
        ? toKey(keyOrEvent, modifiers, options)
        : keyOrEvent,
    )
    return this
  }

  toAfterKeyUp(event: ToEvent): this
  toAfterKeyUp(
    key: ToKeyParam,
    modifiers?: ModifierParam,
    options?: ToEventOptions,
  ): this
  toAfterKeyUp(
    keyOrEvent: ToEvent | ToKeyParam,
    modifiers?: ModifierParam,
    options?: ToEventOptions,
  ): this {
    this.pushOrCreateList(
      this.manipulator,
      'to_after_key_up',
      typeof keyOrEvent === 'string'
        ? toKey(keyOrEvent, modifiers, options)
        : keyOrEvent,
    )
    return this
  }

  toDelayedAction(to_if_invoked: ToEvent[], to_if_canceled: ToEvent[]): this {
    if (this.manipulator.to_delayed_action) {
      this.manipulator.to_delayed_action.to_if_invoked.push(...to_if_invoked)
      this.manipulator.to_delayed_action.to_if_canceled.push(...to_if_canceled)
    } else {
      this.manipulator.to_delayed_action = {
        to_if_invoked,
        to_if_canceled,
      }
    }
    return this
  }

  build(): BasicManipulator {
    return { ...this.manipulator }
  }

  private addToEvent(event: ToEvent) {
    this.pushOrCreateList(this.manipulator, 'to', event)
  }

  private pushOrCreateList<T extends {}>(obj: T, key: keyof T, item: any) {
    const list = (obj[key] || []) as any[]
    list.push(item)
    Object.assign(obj, { [key]: list })
  }
}

export function isManipulatorBuilder(
  src: Manipulator | ManipulatorBuilder,
): src is ManipulatorBuilder {
  return typeof (src as ManipulatorBuilder).build === 'function'
}
