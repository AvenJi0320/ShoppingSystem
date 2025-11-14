import prisma from './client.js';

async function main() {
  // 清空现有数据（按照依赖关系逆序删除）
  await prisma.productComment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.promotionRule.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.product.deleteMany();
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

  // 创建管理员用户
  const adminUser = await prisma.sysUser.create({
    data: {
      phone: '18888888888',
      email: 'admin@example.com',
      password: 'admin123', // 注意：实际项目中应该加密密码
      role: 1, // 管理员
      receive_address: '管理员办公室',
    },
  });

  console.log('创建的管理员用户:', adminUser);

  // 清空现有商品数据
  await prisma.product.deleteMany();

  // 创建测试商品数据
  const product1 = await prisma.product.create({
    data: {
      category_id: 1,
      product_name: 'iPhone 17 Pro Max',
      product_img: 'https://images.pexels.com/photos/34624326/pexels-photo-34624326.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      price: 7999.00,
      stock: 50,
      description: '苹果iPhone 17 Pro Max，搭载A19 Pro芯片',
      status: 1,
    },
  });

  const product2 = await prisma.product.create({
    data: {
      category_id: 1,
      product_name: 'MacBook Air M4',
      product_img: 'https://images.pexels.com/photos/812264/pexels-photo-812264.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      price: 8999.00,
      stock: 30,
      description: '苹果MacBook Air，M2芯片，13.6英寸',
      status: 1,
    },
  });

  const product3 = await prisma.product.create({
    data: {
      category_id: 4,
      product_name: 'Nike Air Max 270',
      product_img: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      price: 899.00,
      stock: 100,
      description: '耐克Air Max 270运动鞋，舒适透气',
      status: 1,
    },
  });

  const product4 = await prisma.product.create({
    data: {
      category_id: 1,
      product_name: 'Sony WH-1000XM5',
      product_img: 'https://images.pexels.com/photos/815494/pexels-photo-815494.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
      price: 2399.00,
      stock: 25,
      description: '索尼降噪耳机WH-1000XM5，顶级降噪体验',
      status: 0, // 下架状态
    },
  });

  console.log('创建的商品数据:', { product1, product2, product3, product4 });

  // 清空现有订单数据
  await prisma.order.deleteMany();

  // 创建测试订单数据
  const order1 = await prisma.order.create({
    data: {
      order_id: 1,
      user_id: user1.user_id,
      total_amount: 8898.00,
      product_list: `${product1.product_id},${product3.product_id}`,
      order_status: 1, // 已完成
    },
  });

  const order2 = await prisma.order.create({
    data: {
      order_id: 2,
      user_id: user2.user_id,
      total_amount: 9898.00,
      product_list: `${product2.product_id},${product3.product_id}`,
      order_status: 0, // 待收货
    },
  });

  const order3 = await prisma.order.create({
    data: {
      order_id: 3,
      user_id: user1.user_id,
      total_amount: 2399.00,
      product_list: `${product4.product_id}`,
      order_status: 2, // 已取消
    },
  });

  const order4 = await prisma.order.create({
    data: {
      order_id: 4,
      user_id: user3.user_id,
      total_amount: 17897.00,
      product_list: `${product1.product_id},${product2.product_id}`,
      order_status: 1, // 已完成
    },
  });

  const order5 = await prisma.order.create({
    data: {
      order_id: 5,
      user_id: user4.user_id,
      total_amount: 899.00,
      product_list: `${product3.product_id}`,
      order_status: 1, // 已完成
    },
  });

  console.log('创建的订单数据:', { order1, order2, order3, order4, order5 });

  // 清空现有商品评论数据
  await prisma.productComment.deleteMany();

  // 创建测试商品评论数据
  const comment1 = await prisma.productComment.create({
    data: {
      user_id: user1.user_id,
      product_id: product1.product_id,
      score: 5,
      content: '非常满意的购买！iPhone 17 Pro Max性能强劲，拍照效果出色，电池续航也很给力。',
    },
  });

  const comment2 = await prisma.productComment.create({
    data: {
      user_id: user2.user_id,
      product_id: product1.product_id,
      score: 4,
      content: '手机整体不错，就是价格有点贵。系统流畅度很好，摄像头升级明显。',
    },
  });

  const comment3 = await prisma.productComment.create({
    data: {
      user_id: user3.user_id,
      product_id: product2.product_id,
      score: 5,
      content: 'MacBook Air M4真的太棒了！轻薄便携，性能强劲，办公和轻度剪辑都很流畅。',
    },
  });

  const comment4 = await prisma.productComment.create({
    data: {
      user_id: user4.user_id,
      product_id: product2.product_id,
      score: 3,
      content: '电脑还可以，但是接口太少，需要额外购买扩展坞。',
    },
  });

  const comment5 = await prisma.productComment.create({
    data: {
      user_id: user1.user_id,
      product_id: product3.product_id,
      score: 5,
      content: 'Nike Air Max 270穿着非常舒适，颜值也很高，搭配衣服很好看！',
    },
  });

  const comment6 = await prisma.productComment.create({
    data: {
      user_id: user2.user_id,
      product_id: product3.product_id,
      score: 4,
      content: '鞋子质量不错，透气性很好，就是尺码稍微有点偏小。',
    },
  });

  const comment7 = await prisma.productComment.create({
    data: {
      user_id: user3.user_id,
      product_id: product3.product_id,
      score: 5,
      content: '超级喜欢这双鞋！走路很轻便，颜值在线，已经推荐给朋友了。',
    },
  });

  const comment8 = await prisma.productComment.create({
    data: {
      user_id: user4.user_id,
      product_id: product1.product_id,
      score: 2,
      content: '手机发热有点严重，而且电池续航不如预期，有点失望。',
    },
  });

  const comment9 = await prisma.productComment.create({
    data: {
      user_id: user1.user_id,
      product_id: product4.product_id,
      score: 5,
      content: 'Sony降噪耳机真的很棒！降噪效果一流，音质也很出色。',
    },
  });

  const comment10 = await prisma.productComment.create({
    data: {
      user_id: user3.user_id,
      product_id: product4.product_id,
      score: 4,
      content: '耳机音质不错，降噪效果很好，就是价格稍微有点贵。',
    },
  });

  // 创建一些没有评论内容的评分数据
  const comment11 = await prisma.productComment.create({
    data: {
      user_id: user4.user_id,
      product_id: product3.product_id,
      score: 4,
      content: null, // 测试content为null的情况
    },
  });

  const comment12 = await prisma.productComment.create({
    data: {
      user_id: user2.user_id,
      product_id: product4.product_id,
      score: 3,
      content: null, // 测试content为null的情况
    },
  });

  // 补充更多的商品评论数据
  const comment13 = await prisma.productComment.create({
    data: {
      user_id: user4.user_id,
      product_id: product2.product_id,
      score: 5,
      content: 'M4芯片性能真的很强！剪视频、做设计都很流畅，续航也很给力，强烈推荐！',
    },
  });

  const comment14 = await prisma.productComment.create({
    data: {
      user_id: user1.user_id,
      product_id: product2.product_id,
      score: 4,
      content: '整体使用体验不错，就是风扇声音偶尔会有点大，其他方面都很满意。',
    },
  });

  const comment15 = await prisma.productComment.create({
    data: {
      user_id: user2.user_id,
      product_id: product1.product_id,
      score: 5,
      content: '拍照效果真的太惊艳了！夜景模式很强，系统也很流畅，值得这个价钱。',
    },
  });

  const comment16 = await prisma.productComment.create({
    data: {
      user_id: user3.user_id,
      product_id: product1.product_id,
      score: 3,
      content: '手机是好手机，但是价格确实有点贵，而且充电速度还有提升空间。',
    },
  });

  const comment17 = await prisma.productComment.create({
    data: {
      user_id: user4.user_id,
      product_id: product3.product_id,
      score: 5,
      content: '超级舒适！穿了一整天都不累，款式也很时尚，已经推荐给朋友了。',
    },
  });

  const comment18 = await prisma.productComment.create({
    data: {
      user_id: user1.user_id,
      product_id: product3.product_id,
      score: 4,
      content: '鞋子质量很不错，做工精细，就是鞋带有点容易松，其他都很满意。',
    },
  });

  const comment19 = await prisma.productComment.create({
    data: {
      user_id: user2.user_id,
      product_id: product3.product_id,
      score: 2,
      content: '尺码不太准，比平时穿的大了一码，而且鞋底有点硬，不太满意这次购买。',
    },
  });

  const comment20 = await prisma.productComment.create({
    data: {
      user_id: user3.user_id,
      product_id: product4.product_id,
      score: 5,
      content: '降噪效果真的无敌！在地铁上听歌完全听不到噪音，音质也很棒，值得入手。',
    },
  });

  const comment21 = await prisma.productComment.create({
    data: {
      user_id: user4.user_id,
      product_id: product4.product_id,
      score: 4,
      content: '耳机整体表现不错，降噪和音质都在线，就是戴久了稍微有点夹头。',
    },
  });

  const comment22 = await prisma.productComment.create({
    data: {
      user_id: user1.user_id,
      product_id: product4.product_id,
      score: 1,
      content: '很失望！降噪效果一般，而且右耳出现了电流声，准备退货了。',
    },
  });

  // 创建一些只有评分没有评论的数据
  const comment23 = await prisma.productComment.create({
    data: {
      user_id: user2.user_id,
      product_id: product2.product_id,
      score: 4,
      content: null,
    },
  });

  const comment24 = await prisma.productComment.create({
    data: {
      user_id: user3.user_id,
      product_id: product1.product_id,
      score: 5,
      content: null,
    },
  });

  const comment25 = await prisma.productComment.create({
    data: {
      user_id: user4.user_id,
      product_id: product1.product_id,
      score: 3,
      content: null,
    },
  });

  const comment26 = await prisma.productComment.create({
    data: {
      user_id: user1.user_id,
      product_id: product1.product_id,
      score: 5,
      content: null,
    },
  });

  // 创建一些中评和差评，让数据更真实
  const comment27 = await prisma.productComment.create({
    data: {
      user_id: user3.user_id,
      product_id: product2.product_id,
      score: 2,
      content: '性能确实不错，但是发热有点严重，而且价格偏高，性价比一般。',
    },
  });

  const comment28 = await prisma.productComment.create({
    data: {
      user_id: user4.user_id,
      product_id: product3.product_id,
      score: 3,
      content: '外观很好看，但是舒适度一般，穿久了会有点磨脚，中规中矩吧。',
    },
  });

  const comment29 = await prisma.productComment.create({
    data: {
      user_id: user2.user_id,
      product_id: product4.product_id,
      score: 1,
      content: '质量有问题！用了一周就坏了，左耳完全没有声音，太差了！',
    },
  });

  const comment30 = await prisma.productComment.create({
    data: {
      user_id: user1.user_id,
      product_id: product2.product_id,
      score: 2,
      content: '屏幕显示效果不错，但是键盘手感很差，而且电池续航远不如宣传的那样。',
    },
  });

  console.log('所有评论数据:', {
    comment1, comment2, comment3, comment4, comment5,
    comment6, comment7, comment8, comment9, comment10,
    comment11, comment12, comment13, comment14, comment15,
    comment16, comment17, comment18, comment19, comment20,
    comment21, comment22, comment23, comment24, comment25,
    comment26, comment27, comment28, comment29, comment30
  });
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