const handleResponseError = (err: any) => {
  if (err?.data?.error) throw err.data.error
  throw err
}

export default handleResponseError
