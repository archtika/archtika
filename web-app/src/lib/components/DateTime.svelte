<script lang="ts">
  const { date } = $props<{ date: string }>();

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  };
</script>

<time datetime={new Date(date).toLocaleString("sv").replace(" ", "T")}>
  {new Date(date).toLocaleString("en-us", { ...options })}
</time>
