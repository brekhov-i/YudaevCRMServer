import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class RoleAuthGuard extends AuthGuard('jwt') {
  constructor(private allowedRoles: string[]) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const canActivate = await super.canActivate(context);

    if (!canActivate) {
      return false;
    }

    const request = context.switchToHttp().getRequest();
    const role = request.headers.userrole;

    if (!role) {
      return false;
    }

    const isAllowed = this.allowedRoles.includes(role);
    return isAllowed;
  }
}
