import Jwt from 'jsonwebtoken'
import { JwtError } from './jwt-error'

export interface Decoded<T> {
  payload: T
  exp: number
  iat: number
}

export class JwtToken<T> {
  public token: string
  public decoded: Decoded<T>

  constructor(token: string = null) {
    this.token = token
  }

  static errorWrapper(code: number): JwtError {
    const err = new JwtError()
    err.code = code
    switch (code) {
      case JwtError.ERROR.EXPIRED_JWT:
        err.message = 'expired jwt'
        break
      case JwtError.ERROR.INVALID_JWT:
        err.message = 'inavlid jwt'
        break
    }
    return err
  }

  create(payload: T, secret: string, expire: string): void {
    if (!payload) {
      throw new JwtError('no payload')
    }
    this.token = Jwt.sign({ payload }, secret, { expiresIn: expire })
  }

  verify(secret: string): void {
    try {
      this.decoded = Jwt.verify(this.token, secret) as Decoded<T>
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw JwtToken.errorWrapper(JwtError.ERROR.EXPIRED_JWT)
      } else {
        console.error(err)
        throw JwtToken.errorWrapper(JwtError.ERROR.INVALID_JWT)
      }
    }
  }
}
