import { Link as WaspRouterLink, routes } from "wasp/client/router";
import { Button } from "../../client/components/ui/button";
import openSaasBannerDark from "../../client/static/open-saas-banner-dark.svg";
import openSaasBannerLight from "../../client/static/open-saas-banner-light.svg";

export default function Hero() {
  return (
    <div className="relative w-full pt-14">
      <TopGradient />
      <BottomGradient />
      <div className="md:p-24">
        <div className="max-w-8xl mx-auto px-6 lg:px-8">
          <div className="lg:mb-18 mx-auto max-w-3xl text-center">
            <h1 className="text-foreground text-5xl font-bold sm:text-6xl">
              文档 <span className="text-gradient-primary">↔</span> Markdown
              <span className="block mt-2">双向转换工具</span>
            </h1>
            <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg leading-8">
              支持PDF、Word与Markdown的相互转换，操作简单，转换精准，完全免费使用
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button size="lg" variant="default" asChild>
                <WaspRouterLink to={routes.FileUploadRoute.to}>
                  立即转换 <span aria-hidden="true">→</span>
                </WaspRouterLink>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <WaspRouterLink to={routes.PricingPageRoute.to}>
                  查看Pro版
                </WaspRouterLink>
              </Button>
            </div>
          </div>
          <div className="mt-14 flow-root sm:mt-14">
            <div className="m-2 flex justify-center rounded-xl md:flex lg:-m-4 lg:rounded-2xl lg:p-4">
              <div className="bg-card rounded-lg shadow-2xl p-8 max-w-3xl w-full">
                <h3 className="text-xl font-semibold mb-4">支持的转换格式</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="font-medium">PDF → Markdown</p>
                    <p className="text-sm text-muted-foreground">将PDF文档转换为干净的Markdown格式</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="font-medium">Word → Markdown</p>
                    <p className="text-sm text-muted-foreground">将Word文档转换为标准Markdown格式</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="font-medium">Markdown → PDF</p>
                    <p className="text-sm text-muted-foreground">将Markdown文件转换为专业PDF文档</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="font-medium">Markdown → Word</p>
                    <p className="text-sm text-muted-foreground">将Markdown文件转换为Word文档格式</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TopGradient() {
  return (
    <div
      className="absolute right-0 top-0 -z-10 w-full transform-gpu overflow-hidden blur-3xl sm:top-0"
      aria-hidden="true"
    >
      <div
        className="aspect-1020/880 w-280 flex-none bg-linear-to-tr from-amber-400 to-purple-300 opacity-10 sm:right-1/4 sm:translate-x-1/2 dark:hidden"
        style={{
          clipPath:
            "polygon(80% 20%, 90% 55%, 50% 100%, 70% 30%, 20% 50%, 50% 0)",
        }}
      />
    </div>
  );
}

function BottomGradient() {
  return (
    <div
      className="absolute inset-x-0 top-[calc(100%-40rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-65rem)]"
      aria-hidden="true"
    >
      <div
        className="relative aspect-1020/880 w-360 bg-linear-to-br from-amber-400 to-purple-300 opacity-10 sm:-left-3/4 sm:translate-x-1/4 dark:hidden"
        style={{
          clipPath: "ellipse(80% 30% at 80% 50%)",
        }}
      />
    </div>
  );
}
