import TSX, { render, useRef } from "./index"

function Page({ name }: { name: string }) {
  const head = useRef<HTMLHeadElement>()
  const ref = useRef<HTMLAnchorElement>()
  const test = useRef<{ test: number }>()
  return (
    <html>
      <head
        ref={el => {
          head.current = el
        }}
      >
        <title>{name}</title>
      </head>
      <body>
        <div className="myTsx">
          <ul>
            {["a", "b", "c"].map(c => (
              <li>{c}</li>
            ))}
          </ul>
          <button
            style={{ color: "red" }}
            ref={console.log}
            onclick={() => console.log("??")}
          >
            click
          </button>
        </div>
      </body>
    </html>
  )
}

render(<Page name={"test"} />, document.body)
