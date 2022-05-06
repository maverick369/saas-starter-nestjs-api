import { JwtPayload } from './jwt-payload.type';

export type JwtPayloadWithRefresh = JwtPayload & { refreshToken };
