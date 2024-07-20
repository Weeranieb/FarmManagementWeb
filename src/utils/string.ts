export const timeToDate = (time: string) => {
  const date = new Date(time)
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
}

export const trimPondName = (name: string) => {
  return name.replace('บ่อ', '').trim()
}

export const firstCapital = (text: string) => {
  return text.charAt(0).toUpperCase() + text.slice(1)
}
