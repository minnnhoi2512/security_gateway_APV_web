import { CalendarOutlined, DashboardOutlined, HistoryOutlined, UserOutlined, WechatWorkOutlined ,LogoutOutlined} from '@ant-design/icons'
import { Menu } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'


const MenuNav = () => {
    const [selectedKey, setSelectedKey] = useState<string>(() => {
        return sessionStorage.getItem('selectedKey') || ''
      })

      const navigate = useNavigate()

      const handleMenuClick = ({ key }: { key: string }) => {
        navigate(`/${key}`)
        setSelectedKey(key)
      }
    
      useEffect(() => {
        sessionStorage.setItem('selectedKey', selectedKey)
      }, [selectedKey])
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
       <Menu
            className="mt-[8%]"
            theme="light"
            mode="inline"
            defaultSelectedKeys={["1"]}
            onClick={handleMenuClick}
            items={[
              {
                key: "dashboard",
                icon: <DashboardOutlined />,
                label: "Thông tin chung",
              },
              {
                key: "manager",
                icon: <UserOutlined />,
                label: "Quản lý",
              },
              {
                key: "departmentManager",
                icon: <UserOutlined />,
                label: "Trợ lý giám đốc",
              },
              {
                key: "security",
                icon: <UserOutlined />,
                label: "Bảo vệ",
              },
              {
                key: "customerVisit",
                icon: <UserOutlined />,
                label: "Danh sách khách",
              },
              {
                key: "card",
                icon: <UserOutlined />,
                label: "Danh sách thẻ",
              },
              {
                key: "gate",
                icon: <UserOutlined />,
                label: "Danh sách cổng",
              },
              {
                key: "project",
                icon: <UserOutlined />,
                label: "Dự án ",
              },
              {
                key: "calendar",
                icon: <CalendarOutlined />,
                label: "Lịch trình",
              },
              {
                key: "history",
                icon: <HistoryOutlined />,
                label: "Lịch sử",
              },
              {
                key: "chat",
                icon: <WechatWorkOutlined />,
                label: "Nhắn tin",
              },
              {
                key: "",
                icon: <LogoutOutlined />,
                label: "Đăng xuất",
              },
            ]}
          />
    </div>
  )
}

export default MenuNav
