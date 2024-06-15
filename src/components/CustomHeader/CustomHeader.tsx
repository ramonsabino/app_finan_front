import React, { useEffect, useState } from "react";
import { Layout, Button, Drawer, Badge, Menu, List, Avatar } from "antd";
import {
  BellOutlined,
  DesktopOutlined,
  FileOutlined,
  HomeOutlined,
  MenuOutlined,
  PieChartOutlined,
  SmileOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import logo_bg from "../../assets/logo_bg.png";
import "./CustomHeader.css";
import { Link, useLocation } from "react-router-dom";
import { useSpring, animated } from "react-spring";
import { useAtendimentoContext, Atendimento } from "../../context/AtendimentoContext";

const { Header } = Layout;

interface CustomMenuProps {
  collapsed: boolean;
  toggleCollapsed: () => void;
  siderRef: React.RefObject<HTMLDivElement>;
}

const CustomHeader: React.FC<CustomMenuProps> = ({
  collapsed,
  toggleCollapsed,
  siderRef,
}) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [bellVisible, setBellVisible] = useState(false);
  const [dataAtual, setDataAtual] = useState(new Date());
  const { pessoasAgendadaDoDia, atendimentosDoDia } = useAtendimentoContext();

  const currentLocation = useLocation();

  useEffect(() => {
    setDataAtual(new Date());
  }, [currentLocation]);

  const showMenuDrawer = () => {
    setMenuVisible(true);
  };

  const showBellDrawer = () => {
    setBellVisible(true);
  };

  const onClose = () => {
    setMenuVisible(false);
    setBellVisible(false);
  };

  const handleClick = () => {
    if (!collapsed) {
      toggleCollapsed();
    }
    onClose();
  };

  const animation = useSpring({
    opacity: menuVisible || bellVisible ? 1 : 0,
    transform: menuVisible || bellVisible ? "translateX(0%)" : "translateX(-100%)",
  });

  return (
    <Header className="site-layout-background custom-header">
      <Button type="primary" onClick={showMenuDrawer} className="menu-icon">
        <MenuOutlined />
      </Button>
      <span className="header-title">Controle Financeiro</span>
      <Badge count={pessoasAgendadaDoDia(dataAtual)} className="bell-icon">
        <Button type="text" onClick={showBellDrawer}>
          <BellOutlined className="bell-icon"/>
        </Button>
      </Badge>
      <Drawer
        title="Atendimentos de Hoje"
        placement="right"
        closable={false}
        onClose={onClose}
        visible={bellVisible}
        width={350}
      >
        <List
          itemLayout="horizontal"
          dataSource={atendimentosDoDia()}
          renderItem={(atendimento: Atendimento) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar icon={<SmileOutlined />} />}
                title={<Link to={`/agenda`}>{atendimento.nomeCliente}</Link>}
                description={atendimento.procedimento}
              />
            </List.Item>
          )}
        />
      </Drawer>
      <Drawer
        title="Menu"
        placement="left"
        closable={false}
        onClose={onClose}
        visible={menuVisible}
        width={250}
      >
        <animated.div style={animation}>
          <Menu mode="inline" defaultSelectedKeys={["1"]} style={{ padding: 0 }}>
            <Menu.Item key="1" icon={<HomeOutlined />} onClick={handleClick}>
              <Link to="/">Página Inicial</Link>
            </Menu.Item>
            <Menu.Item key="2" icon={<PieChartOutlined />} onClick={handleClick}>
              <Link to="/registro-atendimento">Registro de Atendimento</Link>
            </Menu.Item>
            <Menu.Item key="3" icon={<DesktopOutlined />} onClick={handleClick}>
              <Link to="/clientes">Clientes</Link>
            </Menu.Item>
            <Menu.Item key="4" icon={<TeamOutlined />} onClick={handleClick}>
              <Link to="/agenda">Agenda</Link>
            </Menu.Item>
            <Menu.Item key="5" icon={<FileOutlined />} onClick={handleClick}>
              <Link to="/rendimentos">Rendimentos</Link>
            </Menu.Item>
            <Menu.Item key="6" icon={<UserOutlined />} onClick={handleClick}>
              <Link to="/historico-atendimentos">Histórico de Atendimentos</Link>
            </Menu.Item>
          </Menu>
        </animated.div>
      </Drawer>
    </Header>
  );
};

export default CustomHeader;
