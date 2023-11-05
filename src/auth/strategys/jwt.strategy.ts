import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../entities/user.entity";
import { Injectable, UnauthorizedException } from "@nestjs/common";
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

    ) {
        super({
            secretOrKey: process.env.JWT_SECRET,
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        });
    }
    async validate(payload: JwtPayload): Promise<any> {
        const { email, id } = payload;
        const user = await this.userRepository.findOneBy({ email, id });
        if (!user) throw new UnauthorizedException('Token not valid');
        if (!user.isActive) throw new UnauthorizedException('User not active');
        return user;
    }
}