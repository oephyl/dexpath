export default function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-4">
        <img
          src="/images/untitled-20design-20-2810-29.gif"
          alt="Loading..."
          width={120}
          height={120}
          className="w-30 h-30"
        />
        <p className="text-sm text-muted-foreground">Loading Dexpath...</p>
      </div>
    </div>
  )
}
