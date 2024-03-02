export function Prefix({ prefix }: { prefix: string }) {
  if ((prefix ?? '').trim() === '') {
    return <></>
  }
  return (
    <span
      style={{
        color: 'grey',
      }}
      className="prefix"
    >
      {prefix}
    </span>
  )
}
