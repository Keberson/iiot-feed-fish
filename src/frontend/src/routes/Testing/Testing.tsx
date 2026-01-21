import { Card, Flex, Tabs, Typography, Button, message, InputNumber, Space } from "antd";
import {
    RocketOutlined,
    SettingOutlined,
    BarcodeOutlined,
    DashboardOutlined,
    PlayCircleOutlined,
    StopOutlined,
} from "@ant-design/icons";
import CartControl from "../Feeding/CartControl";
import {
    useTestAugerMutation,
    useTestScalesMutation,
    useTestRFIDMutation,
} from "#services/api/testing.api";
import "./Testing.css";

const { Title, Paragraph, Text } = Typography;

const infoCard = (title: string, steps: string[], action?: React.ReactNode) => (
    <Card size="small" title={title}>
        <Flex vertical gap={8}>
            <ol style={{ paddingLeft: 16, margin: 0 }}>
                {steps.map((s) => (
                    <li key={s}>
                        <Text>{s}</Text>
                    </li>
                ))}
            </ol>
            {action}
        </Flex>
    </Card>
);

const Testing = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const [testAuger] = useTestAugerMutation();
    const [testScales] = useTestScalesMutation();
    const [testRFID] = useTestRFIDMutation();

    const handleAugerTest = async (action: "start" | "stop", weight?: number) => {
        try {
            const result = await testAuger({ action, weight }).unwrap();
            messageApi.success(result.message);
        } catch (error: any) {
            messageApi.error(error?.data?.message || "Ошибка при тестировании шнека");
        }
    };

    const handleScalesTest = async (action: "tare" | "check", referenceWeight?: number) => {
        try {
            const result = await testScales({ action, reference_weight: referenceWeight }).unwrap();
            messageApi.success(
                `${result.message}${result.current_weight !== undefined ? ` (текущее: ${result.current_weight} кг)` : ""}`
            );
        } catch (error: any) {
            messageApi.error(error?.data?.message || "Ошибка при тестировании весов");
        }
    };

    const handleRFIDTest = async (id?: string) => {
        try {
            const result = await testRFID({ barcode: id }).unwrap();
            messageApi.success(
                `${result.message}${result.barcode ? ` (ID: ${result.barcode})` : ""}`
            );
        } catch (error: any) {
            messageApi.error(error?.data?.message || "Ошибка при тестировании RFID");
        }
    };

    return (
        <Flex vertical gap={16} className="testing-wrapper">
            {contextHolder}
            <Title level={3}>Тестирование системы</Title>
            <Paragraph type="secondary">
                Раздел для пошагового тестирования компонентов согласно ПМИ (п.13–18).
            </Paragraph>
            <Tabs
                items={[
                    {
                        key: "cart",
                        label: "Движение тележки",
                        icon: <RocketOutlined />,
                        children: (
                            <Flex vertical gap={12}>
                                <CartControl />
                                {infoCard("Проверка движения тележки", [
                                    "Осмотрите тележку и рельсы на повреждения.",
                                    "Запустите движение вперед.",
                                    "Проверьте плавность и отсутствие рывков.",
                                    "Измерьте точность остановки у точки назначения (≤ 5 см).",
                                    "Верните тележку в исходное положение.",
                                ])}
                            </Flex>
                        ),
                    },
                    {
                        key: "auger",
                        label: "Шнековый механизм",
                        icon: <SettingOutlined />,
                        children: (
                            <Flex vertical gap={12}>
                                <Card title="Управление шнеком">
                                    <Space direction="vertical" style={{ width: "100%" }}>
                                        <Space>
                                            <InputNumber
                                                placeholder="Масса (кг)"
                                                min={0.01}
                                                max={100}
                                                step={0.1}
                                                id="auger-weight"
                                            />
                                            <Button
                                                type="primary"
                                                icon={<PlayCircleOutlined />}
                                                onClick={() => {
                                                    const weight = (document.getElementById("auger-weight") as HTMLInputElement)?.value;
                                                    handleAugerTest("start", weight ? parseFloat(weight) : 0.5);
                                                }}
                                            >
                                                Запустить
                                            </Button>
                                            <Button
                                                icon={<StopOutlined />}
                                                onClick={() => handleAugerTest("stop")}
                                            >
                                                Остановить
                                            </Button>
                                        </Space>
                                    </Space>
                                </Card>
                                {infoCard("Проверка шнека", [
                                    "Осмотрите шнек на повреждения и засоры.",
                                    "Подайте малую порцию корма (100–200 г).",
                                    "Проверьте равномерность подачи и отсутствие посторонних звуков.",
                                    "Убедитесь в авт. остановке при достижении заданной массы (≤ 3%).",
                                ])}
                            </Flex>
                        ),
                    },
                    {
                        key: "scales",
                        label: "Весы",
                        icon: <DashboardOutlined />,
                        children: (
                            <Flex vertical gap={12}>
                                <Card title="Управление весами">
                                    <Space direction="vertical" style={{ width: "100%" }}>
                                        <Space>
                                            <Button
                                                type="primary"
                                                onClick={() => handleScalesTest("tare")}
                                            >
                                                Тарировка (обнуление)
                                            </Button>
                                        </Space>
                                        <Space>
                                            <InputNumber
                                                placeholder="Эталонная масса (кг)"
                                                min={0.01}
                                                max={100}
                                                step={0.1}
                                                id="scales-reference"
                                            />
                                            <Button
                                                onClick={() => {
                                                    const weight = (document.getElementById("scales-reference") as HTMLInputElement)?.value;
                                                    handleScalesTest("check", weight ? parseFloat(weight) : undefined);
                                                }}
                                            >
                                                Проверить
                                            </Button>
                                        </Space>
                                    </Space>
                                </Card>
                                {infoCard("Проверка весов", [
                                    "Обнулите показания весов.",
                                    "Положите эталон 100 г, проверьте погрешность ≤ 2%.",
                                    "Повторите для 500 г и 1 кг.",
                                    "Проверьте стабильность показаний (не скачет более ±5 г).",
                                ])}
                            </Flex>
                        ),
                    },
                    {
                        key: "rfid",
                        label: "RFID",
                        icon: <BarcodeOutlined />,
                        children: (
                            <Flex vertical gap={12}>
                                <Card title="Тест RFID">
                                    <Space direction="vertical" style={{ width: "100%" }}>
                                        <Space>
                                            <InputNumber
                                                placeholder="ID (опционально)"
                                                style={{ width: 200 }}
                                                id="rfid-value"
                                            />
                                            <Button
                                                type="primary"
                                                onClick={() => {
                                                    const input = document.getElementById("rfid-value") as HTMLInputElement;
                                                    const id = input?.value || undefined;
                                                    handleRFIDTest(id);
                                                }}
                                            >
                                                Тест считывания
                                            </Button>
                                        </Space>
                                    </Space>
                                </Card>
                                {infoCard("Проверка RFID", [
                                    "Осмотрите RFID-ридер на повреждения.",
                                    "Считайте RFID-метку бассейна — убедитесь в идентификации.",
                                    "Повторите для бункера — проверьте тип корма.",
                                    "Проверьте реакцию на нечитаемую метку (ошибка и безопасный режим).",
                                ])}
                            </Flex>
                        ),
                    },
                ]}
            />
        </Flex>
    );
};

export default Testing;
