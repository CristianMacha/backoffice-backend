import { AggregateRootBase } from '../../../../shared/domain/aggregate-root.base';
import { Email } from './email.value-object';
import { UserStatus } from './user-status.enum';
import { UserCreatedEvent } from '@shared/domain/events/user-created.event';
import { UserRoleChangedEvent } from '@shared/domain/events/user-role-changed.event';
import { Result, ok, err } from '../../../../shared/utils/result';
import { InvalidEmailException } from '../exceptions/invalid-email.exception';

interface UserProps {
  firebaseUid: string;
  email: Email;
  roleId: string;
  status: UserStatus;
}

interface CreateUserProps {
  firebaseUid: string;
  email: string;
  roleId: string;
}

export class User extends AggregateRootBase<string> {
  private _firebaseUid: string;
  private _email: Email;
  private _roleId: string;
  private _status: UserStatus;

  private constructor(
    props: UserProps,
    id: string,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super(id, createdAt, updatedAt);
    this._firebaseUid = props.firebaseUid;
    this._email = props.email;
    this._roleId = props.roleId;
    this._status = props.status;
  }

  static create(props: CreateUserProps): Result<User, InvalidEmailException> {
    const emailResult = Email.create(props.email);
    if (emailResult.isErr) return err(emailResult.error);

    const id = crypto.randomUUID();
    const user = new User(
      {
        firebaseUid: props.firebaseUid,
        email: emailResult.value,
        roleId: props.roleId,
        status: UserStatus.ACTIVE,
      },
      id,
    );
    user.apply(
      new UserCreatedEvent(
        id,
        props.firebaseUid,
        emailResult.value.value,
        props.roleId,
      ),
    );
    return ok(user);
  }

  static reconstitute(
    props: UserProps,
    id: string,
    createdAt: Date,
    updatedAt: Date,
  ): User {
    return new User(props, id, createdAt, updatedAt);
  }

  changeRole(newRoleId: string): void {
    const previousRoleId = this._roleId;
    this._roleId = newRoleId;
    this.touch();
    this.apply(new UserRoleChangedEvent(this._id, newRoleId, previousRoleId));
  }

  deactivate(): void {
    this._status = UserStatus.INACTIVE;
    this.touch();
  }

  ban(): void {
    this._status = UserStatus.BANNED;
    this.touch();
  }

  get firebaseUid(): string {
    return this._firebaseUid;
  }
  get email(): Email {
    return this._email;
  }
  get roleId(): string {
    return this._roleId;
  }
  get status(): UserStatus {
    return this._status;
  }
}
