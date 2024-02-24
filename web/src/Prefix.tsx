export function Prefix({ prefix }: { prefix: string }) {
  if ((prefix ?? '').trim() === '') {
    return <></>
  }
  return (
    <span
      style={{
        margin: '0 0.5rem',
        color: 'grey',
      }}
      className="prefix"
    >
      {prefix}
    </span>
  )
}
