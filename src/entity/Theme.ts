import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserPreference } from "./UserPreference";

@Entity("theme", { schema: "d" })
export class Theme {
  @PrimaryGeneratedColumn({ type: "int", name: "themeId" })
  themeId: number;

  @Column("varchar", { name: "themeName", length: 45 })
  themeName: string;

  @Column("varchar", { name: "themePath", length: 100 })
  themePath: string;

  @OneToMany(
    () => UserPreference,
    userPreference => userPreference.theme
  )
  userPreferences: UserPreference[];
}
