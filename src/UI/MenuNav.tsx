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
                label: "Dashboard",
              },
              {
                key: "customerVisit",
                icon: <UserOutlined />,
                label: "Customer visit",
              },
              // {
              //   key: "securityCustomerVisit",
              //   icon: <UserOutlined />,
              //   label: "Security Customer Visit",
              // },
              {
                key: "DPCustomerVisit",
                icon: <UserOutlined />,
                label: "DP_Customer Visit",
              },
              {
                key: "ProjectManager",
                icon: <UserOutlined />,
                label: "M_Project",
              },
              {
                key: "staffCustomerVisit",
                icon: <UserOutlined />,
                label: "S_Customer Visit",
              },
              {
                key: "calendar",
                icon: <CalendarOutlined />,
                label: "Calendar",
              },
              {
                key: "history",
                icon: <HistoryOutlined />,
                label: "History",
              },
              {
                key: "chat",
                icon: <WechatWorkOutlined />,
                label: "Chat",
              },
              {
                key: "",
                icon: <LogoutOutlined />,
                label: "Logout",
              },
            ]}
          />
    </div>
  )
}

export default MenuNav
