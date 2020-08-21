import { BaseEntity, Entity, PrimaryGeneratedColumn, ManyToOne, Column } from "typeorm";
import Home from "./Home";
import { StatusType } from "../enums/StatusType";

@Entity()
export default class HomeStatus extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column('text')
    status: StatusType;

    @Column('datetime')
    start: Date;

    @Column('datetime')
    end: Date | null;

    @ManyToOne(type => Home, home => home.previousStatusses, { nullable: false })
    home: Home;
}
