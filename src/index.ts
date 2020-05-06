/*
 * @Author: saber2pr
 * @Date: 2019-11-29 22:48:31
 * @Last Modified by: saber2pr
 * @Last Modified time: 2020-05-06 16:23:47
 */
const flat1 = <T>(arr: T[]) => [].concat(...arr)
const flat2 = <T>(arr: T[]) => flat1(flat1(arr))
const has = <T>(array: T[], item: T) => array.includes(item)

const resolve = (props: Props) =>
  Object.entries(props).reduce(
    (props, [k, v]) => {
      // skip tsx prop: ref, style
      if (!has(["ref", "style"], k)) {
        // class, classname -> className
        const className = has(["class", "classname"], k) ? "className" : k
        props[className] = v
      }
      return props
    },
    {} as Props
  )

const flatList = <T>(children: T[]) =>
  flat2(children).filter(ch =>
    typeof ch === "string" ? ch.replace(/ |\r?\n|\r/g, "") : 1
  )

type Props = {
  ref: TSX.Ref<any>
  style: CSSStyle
}

type HostVNode = {
  type: keyof HTMLElementTagNameMap
  props: Props
  children: Node[]
}

const renderDOM = (vnode: HostVNode) => {
  const { type, props, children } = vnode
  const dom = document.createElement(type)

  if (props) {
    Object.assign(dom, resolve(props))
    if (props.style) Object.assign(dom["style"], props.style)

    if (props.ref) {
      if (typeof props.ref === "function") {
        props.ref(dom)
      } else {
        props.ref.current = dom
      }
    }
  }

  dom.append(...children)
  return dom
}

export function TSX(type: any, props: any, ...children: any[]) {
  children = flatList(children)
  if (typeof type === "function") {
    return type({ ...props, children: children[1] ? children : children[0] })
  } else {
    return renderDOM({ type, props, children })
  }
}
export default TSX

export type Suspense = {
  fallback: Node
  children: Promise<Node>
}

export const Suspense = ({ fallback, children }: Suspense) => {
  children.then(dom => {
    const container = fallback.parentNode
    container.replaceChild(dom, fallback)
  })
  return fallback
}

export type LazyComponent = (props: Props) => Promise<{ default: Node }>

export const lazy = (lazyComponent: LazyComponent) => (props: Props) =>
  lazyComponent(props).then(component => component.default)

export const render = (component: Node, container: HTMLElement) => {
  container.innerHTML = ""
  container.append(component)
}

declare global {
  namespace JSX {
    type IntrinsicElements = {
      [K in keyof HTMLElementTagNameMap]: TSX.IntrinsicAttributes<K>
    }

    interface Element extends HTMLElement {}
    interface ElementChildrenAttribute {
      children: {}
    }
    export import Ref = TSX.Ref
  }
}

export namespace TSX {
  export type RefCallback<T> = (instance: T) => void
  export type RefObj<T> = { current: T }
  export type Ref<T> = RefObj<T> | RefCallback<T>

  interface TSXAttributes<T> {
    ref: Ref<T>
    children: any
  }

  type Attributes<K extends keyof HTMLElementTagNameMap> = Override<
    HTMLElementTagNameMap[K],
    "style",
    CSSStyle
  > &
    TSXAttributes<HTMLElementTagNameMap[K]>

  export type IntrinsicAttributes<
    K extends keyof HTMLElementTagNameMap
  > = Partial<Attributes<K>>
}

export type CSSStyle = Partial<CSSStyleDeclaration>

export type Override<T, K extends keyof T, V> = {
  [P in keyof T]: P extends K ? V : T[P]
}

export interface Microtask extends MutationCallback {}

export function microtask(task: Microtask) {
  const observer = new MutationObserver(task)
  const element = document.createTextNode("")
  observer.observe(element, { characterData: true })
  element.data = ""
}

export function useEffect(effect: Function) {
  microtask(() => effect())
}

export function useRef<T>(current: T = null): TSX.RefObj<T> {
  return { current }
}
