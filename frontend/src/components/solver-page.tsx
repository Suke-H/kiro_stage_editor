import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const SolverPage: React.FC = () => {

  return (
    <Card className="w-full max-w-[800px] bg-[#B3B9D1]">
      <CardHeader>
        <CardTitle>解探索モード</CardTitle>
        <CardDescription>「パネルの置き方が何通りあるか」を探索する機能の予定です。鋭意制作中......</CardDescription>
      </CardHeader>
      <CardContent>
        <img src="/kirochan.png" width="50px" alt="工事中" />
      </CardContent>
    </Card>
  );
  };
  
  export default SolverPage;