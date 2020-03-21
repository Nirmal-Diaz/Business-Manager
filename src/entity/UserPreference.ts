import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne
} from "typeorm";
import { User } from "./User";
import { Theme } from "./Theme";

@Index("fk_userPreference_theme1_idx", ["themeId"], {})
@Entity("userPreference", { schema: "d" })
export class UserPreference {
  @Column("int", { primary: true, name: "userId" })
  userId: number;

  @Column("varchar", { name: "name", length: 45 })
  name: string;

  @Column("int", { name: "themeId" })
  themeId: number;

  @OneToOne(
    () => User,
    user => user.userPreference,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "userId", referencedColumnName: "userId" }])
  user: User;

  @ManyToOne(
    () => Theme,
    theme => theme.userPreferences,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "themeId", referencedColumnName: "themeId" }])
  theme: Theme;
}
