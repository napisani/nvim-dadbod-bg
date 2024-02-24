export function Prefix({ prefix }: { prefix: string }) {
  if ((prefix ?? '').trim() === '') {
    return <></>
  }
  return <span className="prefix">{prefix}</span>
}
