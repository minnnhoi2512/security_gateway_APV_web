type Process = {
  processId: number;
  processName: string;
  createTime: Date;
  description: string;
  status: boolean;
  visitTypeId?: number;
  visitType?: number;
  createBy? : number;
};

export default Process;
