import { User } from '../../domain/user/user.aggregate';
import { Email } from '../../domain/user/email.value-object';
import { UserStatus } from '../../domain/user/user-status.enum';

export class UserBuilder {
  private id: string = crypto.randomUUID();
  private firebaseUid = 'firebase-uid-default';
  private email = 'user@example.com';
  private roleId: string = crypto.randomUUID();
  private status = UserStatus.ACTIVE;

  withId(id: string): this {
    this.id = id;
    return this;
  }

  withFirebaseUid(uid: string): this {
    this.firebaseUid = uid;
    return this;
  }

  withEmail(email: string): this {
    this.email = email;
    return this;
  }

  withRoleId(roleId: string): this {
    this.roleId = roleId;
    return this;
  }

  withStatus(status: UserStatus): this {
    this.status = status;
    return this;
  }

  build(): User {
    const emailResult = Email.create(this.email);
    if (emailResult.isErr)
      throw new Error(`Invalid email in builder: ${this.email}`);

    return User.reconstitute(
      {
        firebaseUid: this.firebaseUid,
        email: emailResult.value,
        roleId: this.roleId,
        status: this.status,
      },
      this.id,
      new Date(),
      new Date(),
    );
  }
}
