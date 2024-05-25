import axios from 'axios';
import { Context } from '@nocobase/actions';
import { DataTypes, QueryTypes, Model } from 'sequelize';
import { WxDeptListResponse, WxDept, WxUser, WxUserListResponse, WxDeptUser } from '../models/index';
export class WxSync {
  static async GetDeptList(accessToken: string) {
    const res = await axios.request<WxDeptListResponse>({
      url: 'https://qyapi.weixin.qq.com/cgi-bin/department/list',
      method: 'GET',
      params: {
        access_token: accessToken,
      },
    });

    const depts = res.data.department;
    const parentIds = depts.filter((dept) => dept.parentid != 0).map((dept) => dept.parentid);

    const result = depts.map((dept) => {
      dept.isleaf = !parentIds.includes(dept.id);
      return dept;
    });

    console.log('=== parentIds ===', parentIds);
    console.log('=== deptlist ===', result);
    return result;
  }

  static async GetDeptUsers(accessToken: string, deptId: number) {
    const res = await axios.request<WxUserListResponse>({
      url: 'https://qyapi.weixin.qq.com/cgi-bin/user/list?',
      method: 'GET',
      params: {
        access_token: accessToken,
        department_id: deptId,
      },
    });

    const data = res.data;
    if (data.errcode != 0) throw Error(data.errmsg);

    console.log('=== userlist ===', data.userlist);
    return data.userlist;
  }

  static async getUserIdByCode(accessToken: string, code: string) {
    const res = await axios.request({
      url: 'https://qyapi.weixin.qq.com/cgi-bin/user/getuserinfo',
      method: 'GET',
      params: {
        access_token: accessToken,
        code,
      },
    });

    if (res.data.errcode != 0) throw Error(res.data.errmsg);
    return res.data;
  }

  static async getUserInfoByTicket(accessToken: string, ticket: string) {
    const res = await axios.request({
      url: `https://qyapi.weixin.qq.com/cgi-bin/auth/getuserdetail?access_token=${accessToken}`,
      method: 'POST',
      data: {
        user_ticket: ticket,
      },
    });

    if (res.data.errcode != 0) throw Error(res.data.errmsg);
    return res.data;
  }

  static async createWxDept(ctx: Context, dept: WxDept, appDeptId: number) {
    const deptRepo = ctx.db.getRepository('WxDept');
    const record = await deptRepo.create({
      values: {
        id: dept.id,
        name: dept.name,
        parentid: dept.parentid,
        order: dept.order,
        isleaf: dept.isleaf,
        appDeptId: appDeptId,
      },
    });

    return record;
  }

  static async getOrCreateAppUser(ctx: Context, user: WxUser) {
    const userRepo = ctx.db.getRepository('users');
    const record = await userRepo.findOne({
      filter: {
        $or: [{ phone: user.mobile }, { email: user.biz_mail }],
      },
    });

    if (record != null) return record.dataValues;
    const newRecord = await userRepo.create({
      values: {
        nickname: user.name,
        username: user.userid,
        status: user.status,
        phone: user.mobile,
        email: user.biz_mail,
        password: user.mobile,
      },
    });
  }

  static async getWxDept(ctx: Context, deptId: number) {
    const deptRepo = ctx.db.getRepository('WxDept');
    const record = await deptRepo.findOne({ filter: { id: deptId } });

    return record;
  }

  static async buildUpdateAppDeptParent(ctx: Context) {
    const wxDeptRepo = ctx.db.getRepository('WxDept');
    const appDeptRepo = ctx.db.getRepository('departments');

    const list = await wxDeptRepo.find();
    const depts = list.map((item) => item.dataValues);

    const updates = depts.map((item) => {
      return {
        id: item.appDeptId,
        parentId: item.parentid == 0 ? null : depts.find((i) => i.id == item.parentid).appDeptId,
      };
    });

    console.log('=== updates ===', updates);
    await appDeptRepo.updateMany({ records: updates });
  }

  static async updateWxDept(ctx: Context, dept: WxDept) {
    const deptRepo = ctx.db.getRepository('WxDept');
    const record = await deptRepo.update({
      values: {
        name: dept.name,
        parentid: dept.parentid,
        order: dept.order,
        isleaf: dept.isleaf,
      },
      filter: {
        id: dept.id,
      },
    });

    return record;
  }

  static async createAppDept(ctx: Context, dept: WxDept) {
    const deptRepo = ctx.db.getRepository('departments');
    const record = await deptRepo.create({
      values: {
        title: dept.name,
        parentId: dept.parentid == 0 ? null : dept.parentid,
        sort: dept.order,
        isLeaf: dept.isleaf,
      },
    });

    return record;
  }

  static async updateAppDeptUser(ctx: Context, user: WxUser, appUserId: number) {
    console.log('=== user ===', ctx);
    const appDeptUserRepo = ctx.db.getRepository('departmentsUsers');
    const sequelize = ctx.db.sequelize;
    const depts = await sequelize.query<WxDeptUser>(
      `SELECT WxDept.appDeptId, WxUser.appUserId, WxDeptUser.deptid, WxDept.\`name\`, WxDeptUser.isleader, WxDeptUser.ismain FROM WxDeptUser
      LEFT JOIN WxDept  ON WxDept.id= WxDeptUser.deptid
      LEFT JOIN WxUser ON WxDeptUser.userid = WxUser.id
      WHERE WxUser.userid='${user.userid}'`,
      {
        type: QueryTypes.SELECT,
      },
    );

    depts.forEach(async (dept) => {
      const record = await appDeptUserRepo.findOne({
        filter: {
          userId: appUserId,
          departmentId: dept.appDeptId,
        },
      });

      if (record == null) {
        await appDeptUserRepo.create({
          values: {
            userId: appUserId,
            departmentId: dept.appDeptId,
            isOwner: dept.isleader,
            isMain: dept.ismain,
          },
        });
      } else {
        await appDeptUserRepo.update({
          values: {
            isOwner: dept.isleader,
            isMain: dept.ismain,
          },
          filter: {
            userId: appUserId,
            departmentId: dept.appDeptId,
          },
        });
      }
    });
  }

  static async updateAppDept(ctx: Context, dept: WxDept, appDeptId: number) {
    const deptRepo = ctx.db.getRepository('departments');
    const record = await deptRepo.update({
      values: {
        title: dept.name,
        parentId: dept.parentid == 0 ? null : dept.parentid,
        sort: dept.order,
        isLeaf: dept.isleaf,
      },
      filter: {
        id: appDeptId,
      },
    });

    return record;
  }

  static async createOrUpdateWxUser(ctx: Context, user: WxUser) {
    console.log('=== users ===', user);
    const userRepo = ctx.db.getRepository('WxUser');
    let record = await userRepo.findOne({ filter: { userid: user.userid } });

    if (record == null) {
      record = await userRepo.create({
        values: {
          name: user.name,
          status: user.status,
          enable: user.enable,
          isleader: user.isleader,
          main_department: user.main_department,
          userid: user.userid,
          department: JSON.stringify(user.department),
          is_leader_in_dept: user.is_leader_in_dept,
        },
      });
    } else {
      await userRepo.update({
        values: {
          name: user.name,
          status: user.status,
          enable: user.enable,
          isleader: user.isleader,
          main_department: user.main_department,
          userid: user.userid,
          department: JSON.stringify(user.department),
          is_leader_in_dept: user.is_leader_in_dept,
        },
        filter: {
          userid: user.userid,
        },
      });
    }

    return {
      is_leader_in_dept: user.is_leader_in_dept,
      ...record.dataValues,
    };
  }

  static async recreateWxDeptUsers(ctx: Context, user: WxUser) {
    if (typeof user.department == 'string') user.department = JSON.parse(user.department);

    const deptUserRepo = ctx.db.getRepository('WxDeptUser');
    await deptUserRepo.destroy({ filter: { userid: user.id } });

    console.log('=== user ===', user);

    if (!user.department) return;

    for (let i = 0; i < user.department.length; i++) {
      await deptUserRepo.create({
        values: {
          userid: user.id,
          deptid: user.department[i],
          isleader: user.is_leader_in_dept[i],
          ismain: user.main_department == user.department[i],
        },
      });
    }
  }
}
