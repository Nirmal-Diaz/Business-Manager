import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from "typeorm";
import { User } from "./User";
import { Theme } from "./Theme";

@Index("fk_userPreference_theme1_idx", ["themeId"], {})
@Entity("user_preference", { schema: "business_manager" })
export class UserPreference {
  @Column("int", { primary: true, name: "user_id" })
  userId: number;

  @Column("char", { name: "hash", length: 64 })
  hash: string;

  @Column("varchar", { name: "preferred_name", length: 45 })
  preferredName: string;

  @Column("int", { name: "theme_id", default: () => "'1'" })
  themeId: number;

  @Column("blob", { name: "avatar", nullable: true })
  avatar: Buffer | null;

  @Column("char", { name: "temporary_hash", length: 64 })
  temporaryHash: string;

  @OneToOne(() => User, (user) => user.userPreference, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: User;

  @ManyToOne(() => Theme, (theme) => theme.userPreferences, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "theme_id", referencedColumnName: "id" }])
  theme: Theme;
}
