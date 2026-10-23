import prisma from '../../utils/prisma';

const GetAllUsers = async () => {
  return prisma.user.findMany({});
};

const GetSingleUser = async (id: string) => {
  return prisma.user.findUnique({ where: { id } });
};

const DeleteUser = async (id: string) => {
  await prisma.user.delete({ where: { id } });
};

export const UserService = {
  GetAllUsers,
  GetSingleUser,
  DeleteUser,
};
