import prisma from './client.js';

async function main() {
  // 清空现有数据
  await prisma.sysUser.deleteMany();

  // 创建测试用户数据
  const user1 = await prisma.sysUser.create({
    data: {
      phone: '13800138000',
      email: 'zhangsan@example.com',
      password: 'hashed_password_123',
      receive_address: '北京市朝阳区建国门外大街1号',
    },
  });

  const user2 = await prisma.sysUser.create({
    data: {
      phone: '13900139000',
      email: 'lisi@example.com',
      password: 'hashed_password_456',
      receive_address: '上海市浦东新区陆家嘴环路2号',
    },
  });

  const user3 = await prisma.sysUser.create({
    data: {
      phone: '13700137000',
      email: null, // 测试email为null的情况
      password: 'hashed_password_789',
      receive_address: null, // 测试地址为null的情况
    },
  });

  const user4 = await prisma.sysUser.create({
    data: {
      phone: '13600136000',
      email: 'wangwu@example.com',
      password: 'hashed_password_abc',
      receive_address: '广州市天河区珠江新城3号',
    },
  });

  console.log('创建的用户数据:', { user1, user2, user3, user4 });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });