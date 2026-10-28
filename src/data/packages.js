
export const packages = [
  {
    id: "giga",
    name: "GIGA",
    price: 195000,
    speed: "300–500 Mbps",
    description: "Internet cho gia đình",
    features: [
      "Internet tốc độ cao",
      "Phù hợp học tập và làm việc",
      "Tư vấn thiết bị WiFi phù hợp",
    ],
    featured: false,
  },
  {
    id: "giga-vvip",
    name: "GIGA VVIP",
    price: 230000,
    speed: "300–500 Mbps",
    description: "Internet kết hợp giải trí",
    features: [
      "Internet + Truyền hình",
      "Tư vấn ưu đãi Camera AI",
      "Giải trí cho cả gia đình",
    ],
    featured: true,
  },
  {
    id: "sky-vvip",
    name: "SKY VVIP",
    price: 249000,
    speed: "Lên đến 1 Gbps",
    description: "Internet hiệu năng cao",
    features: [
      "Internet tốc độ cao",
      "Truyền hình giải trí",
      "Tư vấn ưu đãi theo khu vực",
    ],
    featured: false,
  },
];

export const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN").format(price);
