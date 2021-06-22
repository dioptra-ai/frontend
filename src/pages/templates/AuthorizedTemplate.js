import React, {useEffect} from 'react'
import Menu from '../../components/Menu'

const AuthorizedTemplate = ({children}) => {
  useEffect(() => {
    //TODO LOGIN: Check cookie, if not correct then redirect to Paths.LOGIN
  })

  return (
    <div>
      <Menu />
      <div className="px-0 bg-white authorized-content">{children}</div>
    </div>
  )
}

export default AuthorizedTemplate
